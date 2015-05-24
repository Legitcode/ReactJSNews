---
layout: post
title:  "Using Test Driven Development with React.js to Add Multi-Select to the Drag and Drop Component"
excerpt: "[Test Driven Development (TDD)](http://en.wikipedia.org/wiki/Test-driven_development) is a very powerful and popular development methodology. Testing [React.js](http://facebook.github.io/react/) components is most easily accomplished with [Jest](https://facebook.github.io/jest/). However, I rarely see articles that cover the process with lots of examples, especially for React components. This article seeks to do just that. From requirements to all tests green, we will walk through the whole process."
author: James Burnett
date: 2015-02-07 23:27
published: true
categories: react
---
[Test Driven Development (TDD)](http://en.wikipedia.org/wiki/Test-driven_development) is a very powerful and popular development methodology. Testing [React.js](http://facebook.github.io/react/) components is most easily accomplished with [Jest](https://facebook.github.io/jest/). However, I rarely see articles that cover the process with lots of examples, especially for React components. This article seeks to do just that. From requirements to all tests green, we will walk through the whole process.

## Background

In our [last article](https://reactjsnews.com/testing-drag-and-drop-components-in-react-js/), we added some Jest based tests to our Container. I highly recommend reading that article and the preceding articles, especially the article on [Complex Drag and Drop Lists Using React](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/). We will be building on both of these articles for this installment.

For reference, the series so far is:

-   [Using TDD with React.js](https://reactjsnews.com/using-tdd-with-reactjs/) [this article]
-   [Testing the Drag and Drop Component with React.js and Jest](https://reactjsnews.com/testing-drag-and-drop-components-in-react-js/)
-   [Complex Drag and Drop Lists Using React](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/)
-   [Setting up Rails for React and Jest](https://reactjsnews.com/setting-up-rails-for-react-and-jest/)

_All of the code is available on GitHub in the [Dex v2.0 tag](https://github.com/HurricaneJames/dex/tree/v2.0)._

## Starting with Tests

To expand on the last article, we will be using Test Driven Development [TDD](http://en.wikipedia.org/wiki/Test-driven_development) to enhance our Container. This type of development starts with a test, then creates code to make the test pass. Once the test passes, the code can be refactored with confidence.

First, a little role playing. The project manager stopped by our desk and said we need some new functionality. They want our list container to support multi-select drag and drop. After some thought, we come up with some new requirements we can test.

-   clicking on an item should mark it as selected
-   clicking on a selected item should mark it as not selected
-   it should still mark an item as selected when dragging it with no click required
-   it should not mark a previously selected item as not selected when dragging it
-   it should add all of the items to the datatransfer
-   it should add all of the dragged items to the container
-   it should remove all of the selected items from the original container when requested

With these requirements in hand, let's get started.

## Selecting/De-Selecting Items

Since we are using TDD now, we will start with the tests. First up, clicking on an item.

```js
describe("Selecting Items", function() {
  var container, item;
  beforeEach(function() {
    container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    item      = getItemFromContainer(container, 0);
  });

  it('highlights item as selected when clicked', function() {
    expect(item.props.className).toBe('');
    TestUtils.Simulate.click(item);
    expect(item.props.className).toBe('container-selected');
  });

  it('does not highlight items when they are un-selected', function() {
    TestUtils.Simulate.click(item);
    TestUtils.Simulate.click(item);
    expect(item.props.className).toBe('');
  });
});
```

These are both fairly simple to understand and appropriately red when running `npm test Container`. Next up, dragging. We already test that items are selected when dragged. But we should make sure that selected items are not un-selected when dragged.

```js
describe("Drag Start", function() {
  // ...
  it('should keep previously selected items as selected when dragged', function() {
    TestUtils.Simulate.click(item);
    expect(item.props.className).toBe('container-selected');
    TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
    expect(item.props.className).toBe('container-selected');
  });
  // ...
});
```

This test also fails because we do not yet handle the click event. So let's turn these tests green.

### Set

The basic data structure for a collection of unique items is a Set. It just so happens that ECMAScript 6 has such a [Set data structure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). Even better, there is a [polyfill](http://en.wikipedia.org/wiki/Polyfill) available as a Node package, [es6-set](https://www.npmjs.com/package/es6-set). So, up at the top of `Container.jsx`, we should be able to add `var Set = require('es6-set');` and include 'es6-set' in our `package.json` file. Right? Wrong!

It turns out that at least the 'es6-set' package is extremely incompatible with Jest. Just including the library, without even instantiating a single Set, causes Jest to crash and burn. After hours of debugging, no solution was in sight. It seems to be an issue with node packages included by other node packages.

The solution we ultimately decided upon was the creation of a SimpleSet. SimpleSet uses the an almost native ECMAScript 6 Set object when available and a simple subset when not. The implementation is available on GitHub: [SimpleSet](https://github.com/HurricaneJames/dex/blob/master/app/assets/javascripts/components/support/SimpleSet.js) and [SimpleSet-test](https://github.com/HurricaneJames/dex/blob/master/app/assets/javascripts/components/__tests__/support/SimpleSet-test.js).

We did add one function that we consider missing from the ECMAScript 6 spec, toArray(). Technically, ES6 Set has `Array.from()`. However, `Array.from()` only has support in the latest versions of Firefox. We did not consider that an acceptable solution, even for future looking ES6.

Now that we have a SimpleSet implementation, we include it by adding `var Set = require('./support/SimpleSet');` at the top of our `Container.jsx` file. We also need to include `"support/"` in the `unmockedModulePathPatterns` section of the package.json, otherwise Jest will auto-mock the SimpleSet module when it is required.

\* This article was 95% written, and 100% code locked, before I learned about [Immutable.js](https://www.npmjs.com/package/react-immutable-render-mixin). Immutable.js is a superior solution. It has a Set and List implementation. Combining those with the [react-immutable-render-mixin](https://www.npmjs.com/package/react-immutable-render-mixin) makes for a very powerful combination. Expect more on this topic in a future article.

### Adding Multi-Select Support

Now that we have a Set implementation, we need to replace the old `state.selected` with the new Set. Switching from a single `selected` to a `Set` for selected items will require the following changes to `Container.jsx`.

-   `NONE_SELECTED` - delete this variable completely

-   `getInitialState()` - replace `NONE_SELECTED` with `new Set()`

-   `renderListElement()` - add two new props to the `<li />` component

    -   `onClick={this.onClickOnListItem}` - to capture the click event
    -   `data-key={key}` - needed lookup the item when clicked

-   `onClickOnListItem()` [new function]

    ```js
      onClickOnListItem: function(e) {
        var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
        this.toggleSelectedItem(selectedIndex);
        this.setState({ selected: this.state.selected });
      },
    ```

      Notice that we are using `getAttribute('data-key')` because Jest does not support the `dataset` property of elements.

-   `toggleSelectedItem()` [new function]

    ```js
      toggleSelectedItem: function(selectedIndex) {
        return this.state.selected.has(selectedIndex) ? this.state.selected.delete(selectedIndex) : this.state.selected.add(selectedIndex);
      },
    ```

With these changes, the tests for selecting items should go green.

## Starting Drag Operations

Now that we have item selection working, we need to turn our attention to requirements for when dragging operations begin. Again, we are going to start with our tests. Fortunately, these tests are pretty self explanatory.

-   it should still mark an item as selected when dragging it with no click required (existing test, no changes required)

-   it should not mark a previously selected item as not selected when dragging it

    ```js
      it('should keep previously selected items as selected when dragged', function() {
        TestUtils.Simulate.click(item);
        expect(item.props.className).toBe('container-selected');
        TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
        expect(item.props.className).toBe('container-selected');
      });
    ```

-   it should add all of the items to the datatransfer

    ```js
      it("should put all selected items into the data transfer", function() {
        TestUtils.Simulate.click(item);
        var item2 = getItemFromContainer(container, 1);
        TestUtils.Simulate.dragStart(item2, { dataTransfer: mockDataTransfer });
        expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple","banana"]');
      });
    ```

These tests depend on a beforeEach that sets

```
    mockDataTransfer = { setData: jest.genMockFunction() }
    container        = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    item             = getItemFromContainer(container, 0);
```

Running the tests will, as expected, produce nice red responses.

### Making Drag Start Operations Green

Now we need to turn that red to green. Looking at our first set of errors leads to `onDragStart`. It is doing many bad things, from trying to set `selected = selectedIndex` to not including all of the items. So we can start by changing that function.

```js
onDragStart: function(e) {
  var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
  this.state.selected.add(selectedIndex);
  e.dataTransfer.effectAllowed = ALLOWED_DROP_EFFECT;
  e.dataTransfer.setData(DRAG_DROP_CONTENT_TYPE, JSON.stringify(this.getSelectedItems()));
  this.setState({ selected: this.state.selected });
},
```

First, instead of straight assignment, we add the selected index to the selected set. We still limit the drop effect, but now we stringify all the selected items with the help of a `getSelectedItems()` function. Finally we set the new state.

`getSelectedItems()` is fairly simple. It just copies out the selected items into an array, sorts them, and maps the resulting ids to the actual items.

```js
getSelectedItems: function() {
  return this.state.selected.toArray().sort().map(function(itemIndex) { return this.state.items[itemIndex]; }, this);
},
```

A colleague asked me, "why are you sorting the selected items?" We sort the array because Set does not specify or guarantee an order to the items it contains. So, we sort the array to guarantee the component works the same on every possible implementation and environment. This produces an array of items that matches the order of the items as they are displayed.

Also, we now have another set of green tests again. However, our drag and drop tests are still failing.

## Drop Operations

The drag over operations did not change, but we do need to address the differences in drop operations. Our requirements translate fairly well to tests that are already in our spec, they just need to be updated.

### It Should Add All of the Dragged Items to the Container

Starting with our test:

```js
it('adds dropped items to currently selected drop zone', function() {
    var randomDropWords = '["peaches", "cream"]';
    mockEvent.dataTransfer.getData = function() { return randomDropWords; };

    TestUtils.Simulate.dragOver(overItem, mockEvent);
    TestUtils.Simulate.drop(overItem, mockEvent);
    var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
    expect(items).toEqual(randomWords.concat(["peaches", "cream"]));
});
```

In the original test we only added "peaches". This time we are adding `["peaches", "cream"]`. The only other thing that changes is we expect items to equal a slightly longer list. It is still red, but now we can make the changes required to turn this red to green, and they are fairly straight forward.

```js
onDrop: function(e) {
  var data = JSON.parse(e.dataTransfer.getData(DRAG_DROP_CONTENT_TYPE));
  if(this.state.hoverOver !== NO_HOVER) {
    Array.prototype.splice.apply(this.state.items, [this.state.hoverOver, 0].concat(data));
    this.correctSelectedAfterDrop(data);
    this.setState({
      items: this.state.items,
      selected: this.state.selected,
      hoverOver: NO_HOVER
    });
  }
},
```

First we change the splice function to add in all of the data with a little trick. Instead of calling `this.state.items` directly, we call `Array.prototype.splice.apply`. Then we pass in `this.state.items` as the `this` argument for the function and an array for our parameters. If you are unfamiliar with this trick, I highly recommend reading John Resig's and Bear Bibeault's excellent book "[Secrets of the JavaScript Ninja](http://www.amazon.com/Secrets-JavaScript-Ninja-John-Resig/dp/193398869X/)."

We setState as before. For now, `correctSelectedAfterDrop = function() {}`. Run the tests. . . and green. Well, at least this test went green. We will need to update the `correctSelectedAfterDrop` to make the next test pass.

### It Should Remove All of the Selected Items from the Original Container

The previous test, `it('removes selected items', function() {...}`, should still work, but something is wrong with removing the selected items. Looking at `onDragEnd`, it obviously needs some changes. It is still splicing a single item, based on a variable that is not a number anymore, and it is trying to set selected to NONE_SELECTED, which does not exist. Let's take a stab a rewriting this.

_The astute reader will also notice that we made a _faux pas_ in our previous version in that we are setting state variables directly. We are going to clean that up now too._

```js
onDragEnd: function(e) {
  if(e.dataTransfer.dropEffect === ALLOWED_DROP_EFFECT) {
    this.removeSelectedItems();
    this.state.selected.clear();
    this.setState({
      items:    this.state.items,
      selected: this.state.selected,
      hoverOver: NO_HOVER
    });
    return;
  }
  if(this.state.hoverOver !== NO_HOVER || this.state.selected.size !== 0) {
    this.state.selected.clear();
    this.setState({ hoverOver: NO_HOVER, selected: this.state.selected });
  }
},
```

We moved the code for removing selected items into a a separate function, `removeSelectedItems()`. Then we properly clear the set. We set the state correctly. We also fixed the second if statement to properly clear and set the state when the drag operation was cancelled.

The new function to remove selected items is a little more complex than the original splice.

```js
removeSelectedItems: function() {
  return this.state.selected.toArray().sort().reverse().map(function(itemId) { return this.state.items.splice(itemId, 1); }, this);
},
```

We start by converting the selected set into an array and, as before, sorting it. We then reverse that sort so we start from the last selected item first. Going from the first would mess up the indices with every item we removed.

Performance of reverse is unlikely to become a problem with the number of items we have selected, which is probably hundreds at most. However, if ever ever becomes a problem, just remove the `reverse().map()` and replace with a for loop iterating from length down to zero. Yes, we could do it now, but that would be "premature optimization." As Donald Knuth once said "Premature optimization is the root of all evil (or at least most of it) in programming."

We could run our test now, but we are forgetting that we took a pass on `correctSelectedAfterDrop()` in the `onDrop()` function. We need to implement that for real now. Feel free to run the tests, but it will still be red.

```js
correctSelectedAfterDrop: function(droppedItems) {
  if(this.state.hoverOver !== NO_HOVER) {
    var bumpSet = []
      , bumpBy  = droppedItems.length;
    this.state.selected.forEach(function(itemId) { if(itemId >= this.state.hoverOver) { bumpSet.push(itemId); } }, this);
    bumpSet.forEach(function(itemId) { this.state.selected.delete(itemId); }, this);
    bumpSet.forEach(function(itemId) { this.state.selected.add(itemId + bumpBy); }, this);
  }
},
```

First we start by creating a bumpSet. This is an array of selected indices that are greater than or equal to the dropZone index, `hoverOver`. You may remember from an earlier article that we have to correct our selected index pointers for those selected items below the active drop zone because `drop` adds new items to the container before we remove the old ones. Once we have identified the item indices that need to change, we remove each of them from the selected set. Finally, we add them back, bumped by the number of items dropped into the container.

However, we only want to do this if we dropped the items into the container from which they were extracted. This is a bit tricky since the drop event it called on the target container, but not the source container. The solution is to rely on the fact that only one container will have an active drop zone at a time (drop zones are deactivated when the pointer leaves the container). So if we have a drop event and hoverOver is **not** NO_HOVER, then we know we need to modify the selected item indices.

Now, when we run our tests, we see all green. And when we fire up our browser, it works as expected.

## Conclusion

This article shows the TDD process for adding a new feature from start (new requirements) to finish (tests updated, added, and passing). As articles go, it is not particularly exciting or ground breaking. However, for developers who have not written (m)any tests, especially for JavaScript code, I have seen precious few articles giving must direction. Hopefully some developers will find it useful.

## Coming Soon

I am working on an in-depth walk through of [Flux](http://facebook.github.io/flux/) architecture, focusing on the [Reflux](https://github.com/spoike/refluxjs/) library. Reflux is one of the simplest implementations of Flux. If everything goes well, I should have that online by the end of February.

Also, on a side note, a colleague suggested that I start recording these tutorials as screencasts. Before I spend a substantial amount of time, energy, and resources learning how to do that, I would love some feedback on whether anybody would even find it useful.

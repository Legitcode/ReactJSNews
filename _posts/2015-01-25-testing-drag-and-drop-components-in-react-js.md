---
layout: post
title:  "Testing Drag and Drop Components in React.js"
excerpt_separator: <!--more-->
author: James Burnett
date: 2015-01-25 22:50
published: true
categories: react
---
Welcome back! [Last time](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/) we left off with a nice little Container component that allowed dragging and dropping items both internally and between components. However, despite having the ability with our [setup](https://reactjsnews.com/setting-up-rails-for-react-and-jest/), we did not write a single test. The time has come to fix that shortcoming, with lots and lots of examples.

<!--more-->

Welcome back! [Last time](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/) we left off with a nice little Container component that allowed dragging and dropping items both internally and between components. However, despite having the ability with our [setup](https://reactjsnews.com/setting-up-rails-for-react-and-jest/), we did not write a single test. The time has come to fix that shortcoming, with lots and lots of examples.

_Note: All of the code is available on GitHub in the [Dex v2.0 tag](https://github.com/HurricaneJames/dex/tree/v2.0)._

## General Concepts

Test Driven Development ([TDD](http://en.wikipedia.org/wiki/Test-driven_development)) is a development philosophy based on the concept of rapid iteration and automated testing. The TDD process starts with a test to describe a feature or bug. The test runs, and fails. Code is written and then, hopefully, the test passes (goes green). Then the developer can refactor that code knowing that as long as the test stays green, everything should be good.

As a general rule, TDD attempts to do [black-box testing](http://en.wikipedia.org/wiki/Black-box_testing) whenever possible. Put in simple terms, it means we should not need to know the internals of the function we are testing. This helps make our tests less fragile when refactoring code. Of course, when writing tests before code, this is not a problem because we cannot know anything about the internal code until after the test is written.

Overall, TDD improves both design and maintainability of projects. However, a lot of projects, like our Container, were developed without tests. In fact most of us probably spend the majority of our time maintaining and enhancing legacy applications that have no or poor tests. Best practices for dealing with test-poor legacy apps dictate that we wrap some tests around existing features and requirements before enhancing with TDD. And that is exactly what we are going to do in this article.

## Our Testing Toolkit: Jest and React Test Utilities

[Jest](https://facebook.github.io/jest/) is the testing engine designed by Facebook to go with React. It is based on [Jasmine](https://github.com/jasmine/jasmine), so very familiar to anybody who has done Jasmine tests before. Much of the actual test code we write will be standard Jasmine. You will find a lot of useful testing information in the Jasmine [Introduction](http://jasmine.github.io/2.1/introduction.html), especially the section on [included matchers](http://jasmine.github.io/2.1/introduction.html#section-Included_Matchers).

However, unlike Jasmine, Jest is run from the command line and backed by a fake DOM. This makes using Jest with [continuous integration](http://en.wikipedia.org/wiki/Continuous_integration) systems such as [Jenkins](http://jenkins-ci.org/) easier. It also means Jest can spin up multiple processes and run the tests faster.

Jest's biggest advantage is probably "automocking." Modules imported via CommonJS `require()` are automatically mocked. Automocking makes it very easy to test a single module at a time. It also means we need to be careful with some libraries that should not be mocked out. We will cover this in greater detail later.

[React](http://facebook.github.io/react/) provides some nice [testing utilities](http://facebook.github.io/react/docs/test-utils.html). They are located in the "React with Add-Ons" implementation, and accessed via `React.addons.TestUtils`. Be sure to read through the [documentation](http://facebook.github.io/react/docs/test-utils.html) as the 'Simulate' and 'find' / 'scry' methods will be used a lot.

Finally, one small caveat. Jest is billed as "Painless JavaScript Unit Testing." However, Jest and React TestUtils are frequently a pain. Throughout this article, I will point out some of places that Jest complicated our lives and made us write code just for testing. That said, it is a lot better than it could have been and definitely worth the effort. A big thanks goes out to the devs on the Jest and React projects who have made this as easy as it is.

## Getting Started

This article picks up where ["Complex Drag and Drop Lists Using React"](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/) left off. It is recommended reading prior to this article, but not absolutely required. The code for that article is available on GitHub in the [Dex v1.0 tag](https://github.com/HurricaneJames/dex/tree/v1.0). The code for this article is available in the [Dex v2.0 tag](https://github.com/HurricaneJames/dex/tree/v2.0).

We are using a Rails based project structure because that was how we setup our basic demo project in ["Setting up Rails with React and Jest"](https://reactjsnews.com/setting-up-rails-for-react-and-jest/). Tests are located in the `app/assets/javascripts/components/__tests__/` directory. The test file is named `[Component]-test.jsx`, where `[Component]` is the name of the component we are testing. So, the tests for Container will be in `app/assets/javascripts/components/__tests__/Container-test.jsx`, and can run it with `npm test Container`. It should be relatively easy to map this structure to whatever setup is being used.

~~~
# Directory Structure
/app
  /assets
    /javascripts
      /components
        /__tests__
          Container-test.jsx 
        Container.jsx
~~~

Tests are run from the command line via `npm test` or `npm test [Component]`.

## Requirements

The first step of testing a legacy app is to figure out the requirements of the original code. Reviewing the code, there are a few that come to mind quickly. Try to avoid getting too bogged down thinking of requirements, just get a good representation for now. It is easy to add tests for other requirements as they become apparent, which they usually will when working through the initial list.

-   when given a list of items, it should render them all to the screen
-   when given a list of items and a template, it should render the list using the template for each item
-   items should be marked as draggable
-   dragging an item should highlight the item being dragged
-   dragging an item should call setData in the datatransfer with the right type and data being dragged
-   dragging over a dropZone should highlight the drop zone
-   dragging over the top half of an item should active the pervious drop zone
-   dragging over the bottom half of an item should active the next drop zone
-   dragging out of the container should clear any active drop zones
-   dropping should add the item to the list
-   dropping should remove selected items from the original list

As stated previously, there are probably more, but this is a good start. Next we will start building out tests and validating that each one goes green.
    

## The Tests

Jest tests follow the standard 'describe/it' syntax from Jasmine. Also, remember that Jest does automocking, so we need to tell it not to mock our test target. The file will start with something like the following.

~~~js
jest.dontMock('../Container');

describe('Container', function() {
  // it('should put some tests in here', function() {});
});
~~~

_Side note: Jest provides an `it.only()` function to run a single test. This is highly useful when trying to fix a single test at a time._

### When given a list of items, it should render them all to the screen.

~~~js
it('should display items, by default, in a text template (span element)', function() {
  var container = TestUtils.renderIntoDocument(<Container items={randomWords} />);
  expect(container.getDOMNode().textContent).toBe(randomWords.join(''));
});
~~~

First, we start with the `it()` function. Like `describe()`, `it()` expects two parameters, a description and a function. We told Jest not to automock `Container` earlier, so `require()` works like normal. The `Container` is then rendered into the fake DOM with the React `TestUtils.renderIntoDocument()` function. By using a `jsx` extension, the `Container-test.jsx` will automatically convert `<Container items={randomWords} />` into plain JavaScript. The returned `container` is the component that was rendered, and is the basis for all further testing.

Jest tests pass if all expectations pass or if there are no expectations. An expectation is set with the `expect()` function. Here, we expect that the `Container` rendered the words to the page. `container.getDOMNode()` gets the DOM node. The `textContent` property contains all the text content that is rendered inside the node. `expect` then takes a matcher, in this case `toBe()`.

### When given a list of items and a template, it should render the list using the template for each item.

~~~js
var CustomTemplate = React.createClass({
  displayName: 'CustomTemplate',
  propTypes: { item: React.PropTypes.any.isRequired },
  render: function() { return <span className="customFinder">{this.props.item}</span>; }
});

it('should display items with a custom template', function() {
  container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
  var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
  expect(items).toEqual(randomWords);
});
~~~

Just like the last test, we start with `renderIntoDocument`. However, this time we add the `itemTemplate={CustomTemplate}` property. The CustomTemplate is very similar to the default TextTemplate. The only difference between the default `TextTemplate` defined in `Container.jsx` is that we add `className="customFinder"` to make it easy to find our rendered elements.

The second line of our test uses this classname along with the `TestUtils.scryRenderedDOMComponentsWithClass()` function to retrieve the rendered items. `map()` is a standard Array function that iterates over the results of `scryRenderedDOMComponentsWithClass()` and creates an array of the returned items.

Finally, we run our actual `expect()` test. This time we check that `items` is equal to the original array we passed to the `Container`. This works because we pulled out the actual item nodes and iterated each one into an array with map.

### Items should be marked as draggable.

As we saw in the previous article, setting the `draggable` attribute is required for HTML5 Drag and Drop. That means we should probably guarantee that any refactoring does not forget to include it.

~~~js
it('should mark items as draggable', function() {
  var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    , item = TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[1];
  expect(item.getDOMNode().getAttribute('draggable')).toBeTruthy();
});
~~~

As with the last test, this one starts by creating a `container`. We then use `scryRenderedDOMComponentsWithTag()` to grab all of the 'li' components, keeping the second one (the first component is a drop zone). Finally, we test for the `draggable` attribute, expecting it `toBeTruthy()`.

Of course, now that we think about it, it is probably important to be sure that drop zones are not accidentally marked as draggable. Normally, we would not test whether something was not marked. However, drop zones are very similar to items, so it makes sense. It also helps to reinforce that drop zones are always present and not generated during drag operations.

~~~js
it('should not mark drop zones as draggable', function() {
  var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    , dropZone = TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[0];
  expect(dropZone.getDOMNode().getAttribute('draggable')).toBeFalsy();
});
~~~

### Dragging an item should highlight the item being dragged.

In the original article we "highlighted" an item using the [React: CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js) technique of embedded styles. ~~Now, we should be able to test this by calling `getDOMNode().style` or `props.style`, but neither seems to work. They both failed to return the style we set in our Container.jsx file.~~

~~Instead, the solution we chose was the good old `className` property. It is always painful to change working code just for the sake of testing, but sometimes there is no other choice. We can call this pain point #1.~~

For historical, _and stupidity_ reasons, we modified the code to add a className attribute and test for that attirbute. We are keeping that solution here. See the **Changes** section at the bottom for an explanation.

~~~js
it('highlights item as selected when being dragged', function() {
  var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    , item = getItemFromContainer(container, 0)
    , mockDataTransfer = { setData: jest.genMockFunction() };
  expect(item.props.className).toBe('');
  TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
  expect(item.props.className).toBe('container-selected');
});
function getItemFromContainer(container, itemId) {
  return TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[2*itemId + 1];
}
~~~

We do a couple things differently in this test. First we pull the  `scryRenderedDOMComponentsWithTag` logic into a separate function. This is both more readable and [DRYer](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself). Then we make sure the class name is blank initially. Next we simulate a dragStart event so the container only marks dragged items as selected. Then we check whether the className was applied. While we do not actually know that it was highlighted, we know a specific class was added, and presumably that class will trigger some highlighting.

So, what about the `{ dataTransfer: mockDataTransfer }` property. `Simulate.dragSTart` takes an event properties parameter. In this case, we happen to know that our `dragStart` function handler requires a `dataTransfer.setData()` function, so we add a mock function. It slightly breaks black-box testing to know we need to supply a dataTransfer, but it is the only way to test. It would be much better if the React TestUtils supplied the required properties for the events they are simulating, but we can call that pain point #2.

While we are talking about "pain points", I should mention one other. Jest does not support the HTMLElement [`dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.dataset) property. It is probably better that we do not use it anyway because Internet Explorer did not support it until IE11. Also, as the Mozilla Developer Network points out in "Issues" section of the "[Using data attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes)" guide that there is a performance penalty when using `dataset`.

Bottom line, we need to make a few code changes so our tests can pass. First, replace all instances of `dataset.key` with `getAttribute('data-key')`. Second, we need to add the `className` prop to the selected item in `renderListItem`'s `<li />` component.

~~~
`className={this.state.selected.has(key) ? 'container-selected' : ''}`
~~~

With these code changes, our tests now pass.

### Dragging an item should call setData in the datatransfer with the right type and data being dragged.

As we saw in the last test, React TestUtils `Simulate` functions do not replicate the `dataTransfer` event property, but we can mock it on a per call basis. To work with HTML5 Drag and Drop, we must call `dataTransfer.setData()`, so it is probably a really good idea to make sure the call was made.

~~~js
var CONTAINER_TYPE = 'custom_container_type';
it('should set the data transfer with the correct type and the items to being dragged', function() {
  var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    , item = getItemFromContainer(container, 0)
    , mockDataTransfer = { setData: jest.genMockFunction() };
  TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
  expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple"]');
});
~~~

This test is almost the same as the last one. In fact, many devs would combine this test with the last test, but I have found it makes requirements easier to determine if the tests are lower level. However it is arranged, it is important to check that the `mockDataTransfer.setData()` function was called with the right data type, `'custom_container_type'`, and the proper JSON representation of the data. For convenience later, we extract the dataType `'custom_container_type'` into the global variable, `CONTAINER_TYPE`.

### Dragging over a dropZone should highlight the drop zone.

~~~js
var CONTAINER_DROP_ZONE_ACTIVE = 'container-dropZone-active';
it('shows the current dropzone when hovering over drop zone', function() {
  var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    , dropZone = getDropZone(container, 0)
    , mockEvent = { dataTransfer: { types: [CONTAINER_TYPE] } };
  expect(dropZone.props.className).toBe('');
  TestUtils.Simulate.dragOver(dropZone, mockEvent);
  expect(dropZone.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
});
function getDropZone(container, itemId) {
  return TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[2*itemId];
}
~~~

~~Just like our test to see if selected items were highlighted, we run into pain point #1 (no access to style properties) all over again. Again, using the className solution works. This time we simulate a `dragOver` event. ~~

We are keeping the `className` solution becuase it is already done, but style is definitely accessible.

Again, we need to change our code to make the test pass. This time, add the `className={this.state.hoverOver === index ? 'container-dropZone-active' : ''}` to the renderDropZone's `<li />` component.

And now we realize another requirement we had forgotten about in the original list. Part of the HTML5 drag and drop spec is that, by default, drop is not allowed. The spec requires calling `event.preventDefault()` on the dragEnter and/or dragOver operations. Also, our container only allows drops for certain types. Fortunately, we know how to mock functions for the simulated event. 

~~~
mockEvent = {
  dataTransfer: { types: [CONTAINER_TYPE] },
  preventDefault: jest.genMockFunction()
}
~~~

We can test that this was called using the expect `toBeCalled()` matcher. 

~~~
expect(mockEvent.preventDefault).toBeCalled();
~~~

We only allow drops when a drop zone is activated, so it is perfectly acceptable to make this a second expectation of the current test. If you are really paranoid, you could create another test with a bad container type to verify the mock event `preventDefault()` function was `not.toBeCalled()` and that the drop zone was not activated.

~~~js
it('should not activate a dropzone when the container type is wrong', function() {
  var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
    , dropZone = getDropZone(container, 0)
    , mockEvent = { dataTransfer: { types: ['bad_type'] } };
  expect(dropZone.props.className).toBe('');
  TestUtils.Simulate.dragOver(dropZone, mockEvent);
  expect(dropZone.props.className).not.toBe(CONTAINER_DROP_ZONE_ACTIVE);
  expect(mockEvent.preventDefault).not.toBeCalled();
});
~~~

### Dragging over the top half of an item should active the pervious drop zone.

At this point we have started repeating ourselves. So first we are going to make use of the very helpful `beforeEach()` function. `beforeEach()` will run before each of the tests in a `describe()` block. This gives us a way of setting up some common variables and making sure they are the same for each test. As a side note, Jasmine has three other [Setup and Teardown](http://jasmine.github.io/2.1/introduction.html#section-Setup_and_Teardown) functions that you might find useful.

~~~js
var container, item, dropZoneAbove, dropZoneBelow, mockEvent;
beforeEach(function() {
  mockEvent     = {
    dataTransfer: { types: [CONTAINER_TYPE] },
    preventDefault: jest.genMockFunction()
  }
  container     = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
  overItem      = getItemFromContainer(container, 2)
  dropZoneAbove = getDropZone(container, 2)
  dropZoneBelow = getDropZone(container, 3)
});
~~~

Do not forget to refactor the previous tests in the same describe block to use the variables defined in beforeEach, otherwise there is unnecessary duplicate code.

Now, run the tests again. If every thing is still green, it is time to check that dragging over the top half of an item activates the drop zone above that item.

~~~js
it('shows previous drop zone when hovering over top half of item', function() {
  mockEvent.clientY = 2;
  overItem.getDOMNode().offsetTop = 0;
  overItem.getDOMNode().offsetHeight = 10;

  expect(dropZoneAbove.props.className).toBe('');
  expect(dropZoneBelow.props.className).toBe('');
  TestUtils.Simulate.dragOver(overItem, mockEvent);
  expect(dropZoneAbove.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
  expect(dropZoneBelow.props.className).toBe('');
  expect(mockEvent.preventDefault).toBeCalled();
});
~~~

Notice that we are specifying the mouse position (`clientY`) and item dimensions (`offsetTop` and `offsetHeight`). Interestingly, this test did pass in this environment. However, it might throw errors in other environments because those values are used but not defined. Also, Be sure to note that we have three expectations for this test. The first two check that the right drop zone was activated. The last checks that this method of activating a drop zone also calls prevent default.

### Dragging over the bottom half of an item should active the next drop zone.

~~~js
it('shows next drop zone when hovering over bottom half of item', function() {
  mockEvent.clientY = 7
  overItem.getDOMNode().offsetTop = 0;
  overItem.getDOMNode().offsetHeight = 10;

  expect(dropZoneAbove.props.className).toBe('');
  expect(dropZoneBelow.props.className).toBe('');
  TestUtils.Simulate.dragOver(overItem, mockEvent);
  expect(dropZoneAbove.props.className).toBe('');
  expect(dropZoneBelow.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
  expect(mockEvent.preventDefault).toBeCalled();
});
~~~

This test looks almost identical to the last test. The only change is our mouse position (`clientY`) is now 7. We define the item to be 10px high with `offsetHeight`, so this puts the drag event in the bottom half of the item.

Unlike the last test, this one will fail without the mouse position and item dimensions. In environments where the code does not throw an error, the wrong drop zone will be activated. Providing the mouse position and element height fix this problem.

### Dragging out of the container should clear any active drop zones.

This was an important fix from the last article. Otherwise drop zones remain active after dragging the item out of the container, even when just dragging over a container.

~~~js
it("should clear any active drop zones when the dragged item leaves the container", function() {
  var containerElement = TestUtils.findRenderedDOMComponentWithTag(container, 'ul').getDOMNode();

  TestUtils.Simulate.dragOver(overItem, mockEvent);
  expect(TestUtils.scryRenderedDOMComponentsWithClass(container, CONTAINER_DROP_ZONE_ACTIVE).length).toBe(1);

  mockEvent.clientX = 0;
  mockEvent.clientY = 101;
  containerElement.offsetTop = containerElement.offsetLeft = 0;
  containerElement.offsetHeight = containerElement.offsetWidth = 100;

  TestUtils.Simulate.dragLeave(containerElement, mockEvent);
  expect(TestUtils.scryRenderedDOMComponentsWithClass(container, CONTAINER_DROP_ZONE_ACTIVE).length).toBe(0);
});
~~~

First, our `container` is the React element, not the list element where we attached the `onDragLeave` event handler. That means we need to capture the `'ul'` element to `containerElement`. This is done with `findRenderedDOMComponentWithTag()`. So far we have been using the `scry` versions of these functions. `scry` will find all, `find` will find the single instance and throw an error if it is unable.

Next, we simulate a dragOver event and check that it activated one of the drop zones. 

Then we setup the mouse coordinates and bounding dimensions of the list. We know from the code that these are important, but we also know from the HTML5 spec that they will be provided.

Finally, we simulate the drag leave and check that the number of active drop zones is now back to zero.

### Dropping should add the item to the list.

For our drop testing we will use a new beforeEach setup.

~~~js
beforeEach(function() {
  container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords.slice(0)} />);
  overItem  = getDropZone(container, randomWords.length)
  mockEvent = { dataTransfer: { types: [CONTAINER_TYPE] } }
});
~~~

This will give us a container, with `overItem` pointing to the last dropZone and a basic mockEvent. Then we can test whether dropping adds the item.

~~~js
it('adds dropped items to currently selected drop zone', function() {
    mockEvent.dataTransfer.getData = function() { return '"peaches"'; };

    TestUtils.Simulate.dragOver(overItem, mockEvent);
    TestUtils.Simulate.drop(overItem, mockEvent);
    var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
    expect(items).toEqual(randomWords.concat(["peaches"]));
});
~~~

First, we add a mock getData function that just returns `"peaches"`. Then we simulate a drag over to activate a drop zone, and we simulate a drop event to put that data into the container. Finally, we extract the items and see if our new item has been appended to the end.

### Dropping should remove selected items from the original list.

~~~js
it('removes selected items', function() {
  var item = getItemFromContainer(container, 0);
  mockEvent.dataTransfer.dropEffect = "move";
  mockEvent.dataTransfer.setData = function() {};
  mockEvent.dataTransfer.getData = function() { return "[\"" + randomWords[0] + "\"]"; };
  TestUtils.Simulate.dragStart(item, mockEvent);
  TestUtils.Simulate.dragOver(overItem, mockEvent);
  TestUtils.Simulate.drop(overItem, mockEvent);
  TestUtils.Simulate.dragEnd(item, mockEvent);
  var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
  // array where first item is now last
  expect(items).toEqual(randomWords.slice(1).concat(randomWords[0]));
});
~~~

This time we grab the first item in the container. We setup the mockEvent dataTransfer with that item's information. Then we simulate all of the events that normally happen, including the dragEnd. Then we check that the result is the list with with the first item removed and pinned to the end (`randomWords.slice(1).concat(randomWords[0])`).

## Conclusion

This article should have provided a decent description of testing a complex React component with Jest. We covered basic Jasmine syntax (`describe`, `it`, `it.only`, `expect`, `toBe`, `toEqual`, `toBeCalled`, `not`, `beforeEach`). We covered how to actually run the tests `npm test`. We saw quite a few of the React test utilities (`Simulate.[click, dragStart, dragOver, dragLeave, drop, dragEnd]`, `scryRenderedDOMComponentsWithClass`, `scryRenderedDOMComponentsWithTag`, `findRenderedDOMComponentWithTag`). We covered mocking the event data object, and some of the pain that it causes. And we gave lots of working test code as examples in the process.

This article also provides a decent starting point for the next article, [Using Test Driven Development with React.js](https://reactjsnews.com/using-tdd-with-reactjs/). In fact, that article was originally part of this article. As the length of this article grew, it was clear it needed to be broken up a bit. On the bright side, that means there is already a draft, so it should be up in the next couple days.

## Changes

So, as often happens, the solution to a problem comes to us when doing _other_ things. And, as is often the case, that solution humbles us and makes us feel stupid. This is one such solution. 

Originally, I argued that the `style` property was unavailable. This ruined the otherwise beautiful CSS in JS paradigm. I was wrong.

The `style` property is perfectly available via `item.props.style`. However, what is not available is the `ObjectMerge` module, because we forgot to tell Jest not to auto-mock it. Since it was mocked, it does not actually merge anything. Solution, `jest.dontMock()` or move the ObjectMerge.jsxand Object.Assign.js to the `support/` directory, which is on the `unmockedModulePathPatterns` in package.json.

I always try to look on the bright side of things, and there is a bright side to this story. My pain and humiliation serves as a [cautionary tale](http://www.despair.com/mistakes.html) of the to others. Auto-mocking is great, but it has some gotchas.

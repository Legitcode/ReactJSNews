---
layout: post
title:  Building a test suite in React JS
date: 2014-12-08 18:59
published: true
categories: react
---
I'm primarily a Rails developer but everyday I seem to be writing more and more front end JavaScript. While writing Ruby, tests are a given part of the process. This is not the case with JavaScript. I've always found that odd and I've also written enough JavaScript to intimately know how frustrating it can be. 

It's a delight writing Ruby with a test suite so why is it acceptable that most JavaScript goes into production without automated tests? I believe difficulty and fear are the culprit. It's hard to get started; the tooling, workflow and even what to test are foreign. Rather than continue to deal with difficult JavaScript applications I decided to learn how to develop a test suite.

I've also been writing a lot of JavaScript with [React](http://facebook.github.io/react/). I could write a length post on why React is great library for building user interfaces, I will one day, but for now I want to mention that my test suite targets React. Another reason to mention this is that React is very conducive to testing, hopefully this becomes more apparent with my examples.

If React is a bit of a new concept to you I highly suggest taking ten minutes to work through the [official tutorial](http://facebook.github.io/react/docs/tutorial.html) - it's a worthy investment.

## Application Setup

If you'd like to follow along by writing code (I strongly suggest you do) you need should clone this boilerplate for a quick start.

`git clone https://github.com/jarsbe/react-webpack-boilerplate test-suite`

`cd test-suite`

`npm install`

Firstly we need something to test. The application we'll create is simply (stupid) point of sale tool. There will be two components; an `App` component which contains a list of items and a `Checkout` component which contains a list of all selected items. The `Checkout` component also has a counter for the total number of selected items. An item can be selected by clicking on it. I told you it was simple!

If you are coding along replace the `main.js` file with the following code.

```
var React = require('react'),
    App = require('./app');

React.render(<App />, document.body);
```

Next remove the `component.js` file and create the `app.js` and `checkout.js` files.

```
var React = require('react'),
    Checkout = require('./checkout');

var App = React.createClass({

  onSelectItem: function(index) {
    var item = this.props.items[index];
    
    this.setState({
      selectedItems: this.state.selectedItems.concat(item)
    });
  },

  getInitialState: function() {
    return {
      selectedItems: [] 
    };
  },

  getDefaultProps: function() {
    return {
      items: [{ title: 'Bread' }, { title: 'Milk' }, { title: 'Cheese' }]  
    };
  },

  render: function() {
    var listItems = this.props.items.map(function(item, i) {
      return <li key={"item" + i} onClick={this.onSelectItem.bind(null, i)}>{item.title}</li>
    }.bind(this));

    return (
      <div> 
        <ul>{listItems}</ul>

        <Checkout items={this.state.selectedItems} />
      </div>
    );
  }
});

module.exports = App;
```

```
var React = require('react');

var Checkout = React.createClass({

  render: function() {
    var listItems = this.props.items.map(function(item, i) {
      return <li key={"selectedItem" + i}>{item.title}</li>
    });
    var count = listItems.length;
    return (
      <div>
        <ul>
          {listItems}
        </ul>
        <span>{count}</span>
      </div>
    );
  }
});

module.exports = Checkout;
```

Take 5 minutes to read how the application works. To run the application execute `webpack -w` (install [webpack](https://www.npmjs.org/package/webpack) if you need it), in another terminal change directory into the site `cd site` and run a server `python -m SimpleHTTPServer`. Now the application is available on `http://localhost:8000`. Time to get testing.

## Testing Setup

To build a test suite we need tools. Facebook uses [Jest](https://facebook.github.io/jest/), which is a layer upon [Jasmine](http://jasmine.github.io/). Jest offers automatic mocking and uses [JSDom](https://github.com/tmpvar/jsdom) for running tests in the command line (rather than the browser). Automatic mocking is useful since we'll be testing components in isolation, all of our dependencies will be mocked by Jest. Take a look [here](https://facebook.github.io/jest/docs/automatic-mocking.html) for more information on automatic mocking. Along with Jest we need [React Tools](https://www.npmjs.org/package/react-tools) to transform any JSX during testing, this is optional but very helpful.

To install these tools.

`npm install jest-cli react-tools --save-dev`

To transform JSX a helper function is required. In a `support` folder create a `preprocessor.js` file to do the work.

```
var ReactTools = require('react-tools');

module.exports = {
  process: function(src) {
    return ReactTools.transform(src);
  }
};
```

To use the preprocessor add this configuration inside the `package.json` file. It adds test script and informs Jest of the preprocessor function. It also makes sure that React itself is not automatically mocked!

```
"scripts": {
  "test": "jest"
},
"jest": {
  "scriptPreprocessor": "<rootDir>/support/preprocessor.js",
  "unmockedModulePathPatterns": [
    "<rootDir>/node_modules/react"
  ]
}
```

Next add a folder called `__tests__` in the root directory. Jest is magical enough to automatically run any test in any files sitting in this directory.

Just for sanity run `npm test`. Jest should run and everything should pass with flying colours.

## Testing

Now the moment we've been waiting for, writing tests. Here's a spoiler - all the hard work has been done. The original goal of this post was to learn how to setup a JavaScript test suite. With that out of the way everything else is an implementation detail but ending it here wouldn't be much fun, so on to the tests.

The simplest component is the `Checkout`. It accepts only one property `items` and generates a list from those `items`. The `Checkout` also calculates a total `items` count.

To get this component tested create a `checkout-test.js` file inside the `__tests__` directory. It also needs some boilerplate code like so.

```
jest.dontMock('../components/checkout.js');

var React = require('react/addons'),
    Checkout = require('../components/checkout.js'),
    TestUtils = React.addons.TestUtils;

describe('Checkout', function() {

  it('renders each item as a li', function() {
  
  });

  it('displays the items count', function(){
  
  });
});
```

Here Jest is told not to mock the `Checkout` component then all the necessary dependencies are required. Finally there are two empty tests; one to check each item is rendered, the next to make sure the item count is correct.

To get these tests running you need to create an instance of the component, give it some items to render and finally select the DOM nodes to test.

```
describe('Checkout', function() {

  var CheckoutElement = TestUtils.renderIntoDocument(
    <Checkout items={[{ title: 'test' }, { title: 'test' }]} />
  );

  var items = TestUtils.scryRenderedDOMComponentsWithTag(CheckoutElement, 'li');
  var count = TestUtils.findRenderedDOMComponentWithTag(CheckoutElement, 'span');  
...}
```

The final piece of the puzzle is to add the expectations to each test. 

```
...
it('renders each item as a li', function() {
  expect(items.length).toEqual(2);
});

it('displays the items count', function(){
  expect(count.getDOMNode().textContent).toEqual('2');
});
```

Nice and simple. We make sure there are two `li` nodes and that the items count is correct. The nice thing about React is that it's simple to test. The `Checkout` component is given data and the tests make sure it renders as expected. You can see this pattern again after testing the `App` component. 

```
jest.dontMock('../components/app.js');

var React = require('react/addons'),
    App = require('../components/app.js'),
    TestUtils = React.addons.TestUtils;

describe('App', function() {

  var AppElement = TestUtils.renderIntoDocument(<App/>);

  var list = TestUtils.scryRenderedDOMComponentsWithTag(AppElement, 'ul')[0];
  var items = TestUtils.scryRenderedDOMComponentsWithTag(AppElement, 'li');

  it('has 3 default items', function() {
    expect(list.props.children.length).toEqual(3);
  });

  it('has no selected items', function() {
    expect(AppElement.state.selectedItems.length).toEqual(0);
  });

  describe('clicking an item', function() {
    it('adds it to the selected items', function() {
      TestUtils.Simulate.click(items[0]);
      expect(AppElement.state.selectedItems.length).toEqual(1);
    });
  });
});
```

These tests follow the same create a component, give it data and expect output pattern. There's also the added complexity of component state and function calls. Clicking an item in the `App` list should add that item to the `Checkout` list. This happens via a state change in `App`. The only thing we need to test is that clicking on an item adds it to the state's selected items array.

## Conclusion

Before embarking on building this test suite I had never tested any JavaScript code. It feels silly that I have put it off for so long after realising how simple and similar (to RSpec) it is. I'm also fully away that React makes this testing quite simple, given the patterns explained above. Hopefully this has helped you banish some of the fear behind testing JavaScript too.

A few things that helped me was figuring out where to look in the documentation. Since I'm using 3 different tools (Jest, Jasmine & React Tools) it was confusing at first. I got started by looking at [Jest](https://facebook.github.io/jest/docs/tutorial-react.html#content) specifically the React section and then reading the API (which is very concise). Next I had a look through both the [Jasmine Guide](http://jasmine.github.io/2.0/introduction.html) and the [React Test Utils](http://facebook.github.io/react/docs/test-utils.html). It's a bit strange looking through 3 sets of documentation, but they work surprisingly well together. 

As a final note you may have noticed everything is using CommonJS like modules. As a Rails developer this is very foreign and almost a reason to avoid testing all together. Don't fret however, you can have your cake and eat it too. I strongly suggest reading James McCann's post on incorporating [Webpack with Rails](http://www.jamesmccann.nz/2014/11/27/bundling-npm-modules-through-webpack-and-rails-asset-pipeline.html).  
## Unit and Functional testing React Components

In the last 4 months I've started writing all of my front end code using React, and I love it. However, deciding on what
combination of tools to use to test my code has been, well, difficult. I typically write all of my server side using Ruby
and Rails. Both Ruby and Rails have a great testing ecosystem, and getting up and running with unit tests is dead simple,
and there are lots of great posts out there on how to get started. 

I haven't found the same to be true in the React ecosystem. There are quite a few posts out there on how to get setup, but
typically they only go so far as showing you how to test that an `<h1>` tag was rendered with the text `Hello World!` inside
of it. That's great, but what if you have a more complex UI? What if you're using flux and your user interactions trigger
actions and interactions with stores? How do you use mocks and stubs?

Facebook recommends and uses Jest for all of their testing needs, and there are lots of great blog posts out there as to why 
a lot of people don't like using Jest, and I agree with them so I won't go into a lot of detail. But the two biggest ones
are how slow Jest tests run and the way that Jest automatically mocks out everything and you have explicitly tell it to not
mock out certain components.

Because of this, I wanted to write a quick short post on what frameworks I decided on and how I got it all working.

### Mocha

I chose [MochaJS](https://mochajs.org/) as my base test framework and test runner. I played around with using Karma on top of
Mocha, but it was just way too slow. I decided that I wanted a true headless testing environment, and I will leave the
testing of multiple browsers to my CI build.

I have used [Jasmine](http://jasmine.github.io/) before, and I like it, but I chose Mocha because it tries very hard to
be simple, flexible, and agnostic about the other tools that you want to use in conjunction with it. It also has a nice
integration with [ChaiJS](http://chaijs.com/). I really like that I can use ChaiJS to allow the developers on my team to
be able to choose which assertion style they'd like to use. 

### Mocking and Stubbing

It took me awhile to choose a library for this, but in the end I chose [SinonJS](http://sinonjs.org/). A lot of people prefer
this library, and it has a nice Chai integration, which makes for nice readable assertions.

```javascript
expect(SessionStub).to.have.been.calledWith({ email: "foo@bar.com", password: "foobar123" });
```

As opposed to the standard Sinon syntax

```javascript
assert(SessionStub.calledOnce);
```

This makes for really nice, readable assertion, and it can be mixed in with all of Chai's other assertion styles as well.

### Putting it all together

One thing I stated earlier that I wanted to be able to do was headless testing. I reeally like to have a fast, tight, feedback
loop while testing and writing code. This setup has allowed me to do that, and I can rely on my CI builds to do the full browser
testing.

I started by installing all my dependencies:

```bash
$ npm install --save-dev mocha mocha-babel node-jsdom sinon sinon-chai chai
```

Ok great, we've all of our dependencies installed, but how do we put it all together. 

The first thing we need to is get Mocha setup. I like to be able to run my tests by just using `npm test`, so the first thing
we have to do is add a line to our `package.json` file:

```json
"scripts": {
  "test": "mocha --opts ./test/javascripts/mocha.opts --compilers js:babel/register --recursive test/javascripts/**/*.jsx"
}
```

The last part of that script line is the path to the tests in my project, and you'll have to change it to suit your needs.
It's essentially telling Mocha to search for all files with a `.jsx` extenstion in all subdirectories of the javascript
directory. You'll also notice the --compilers flag. We write all of our React components using ES6 and JSX, so I wanted to
have our test suites follow the same convention. This tells Mocha to use the Babel compiler for all of the test files.

Next we're going to want to get our Mocha options setup. We do this using a `mocha.opts` file. You can see above I'm using the
--opts flag to tell Mocha where to look for this file. By default it looks in the `test` directory, but because I am 
using this inside of a Rails project, all of my javascript related files live one directory deeper in the javascript directory.

My `mocha.opts` file is pretty simple:

```
--require ./test/javascripts/setup
--full-trace
```

I'm just requiring a setup file that creates the virtual dom that we need for headless testing, and telling Mocha that I want
the full trace when an error occurs during testing. I've found that the error messages that Mocha outputs during testing, while
being succint, are not very helpful, and I like having the full stack trace for better debugging.

The setup file that we use for the virtual dom looks like this:

```javascript
require("babel/register")({
  stage: 0
});

var jsdom = require('node-jsdom');

// setup the simplest document possible
var doc = jsdom.jsdom('<!doctype html><html><body></body></html>');

// get the window object out of the document
var win = doc.defaultView;

// set globals for mocha that make access to document and window feel 
// natural in the test environment
global.document = doc;
global.window = win;

// take all properties of the window object and also attach it to the 
// mocha global object
propagateToGlobal(win);

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global[key] = window[key]
  }
}
```

The first thing we're doing is configuring Babel to use the experimental ES7 features because we are using a few of these
in our components. I borrowed the rest of the DOM setup from [this](http://jaketrent.com/post/testing-react-with-jsdom/) great
post.

The next thing we need to do is get Sinon and Chai working with our test suite. This essentially requires some setup at the
beginning of each test to make everything available. Coming from the Ruby and Rails world, I typically don't like to repeat
code a lot, and so I created a `test_helper.js` file to help DRY up my test code. 

```javascript
import React from 'react/addons';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

let { assert, expect } = chai,
    { TestUtils } = React.addons;

chai.should();
chai.use(sinonChai);

export {
  React,
  chai,
  sinon,
  sinonChai,
  assert,
  expect,
  TestUtils
}
```

This essentially imports all the files that are needed in every test, pulls in Chai and Sinon, and tells Chai to use
sinonChai for Sinon assertions. Then at the top of all of our test files we can just do this:

```javascript
import {
  React,
  sinon,
  assert,
  expect,
  TestUtils
} from '../../test_helper';
```

And we will have everything we need for our tests! Awesome.

### A sample test file

In our app we of course have a login screen, and so I wrote a simple test for that. Let's break it down into it's parts
and see how all of this has come together.

#### Test Setup

```javascript
import {
  React,
  sinon,
  assert,
  expect,
  TestUtils
} from '../../test_helper';

import NewSession from '../../../../app/assets/javascripts/views/sessions/new';
import { sessionActions } from '../../../../app/assets/javascripts/flux/session_flux';
```
So first we're just pulling in all the dependencies from the test helper, and then the component, and the flux action
that we will be stubbing.

#### Setting up for each test

```javascript
describe('NewSession component', () => {
  let data = {
    form: {
      formAttrs: {
        email: {
          label: "Email Address",
          type: "email",
          value: "foo@bar.com",
          validation: "value.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/i)",
          errorMessage: "A valid email address is required"
        },
        password: {
          label: "Password",
          type: "password",
          value: "foobar",
          validation: "value.length > 0 && value.length < 73",
          errorMessage: "Password must be between 1 and 72 characters long"
        }
      }
    }
  }   

  var sandbox, loginForm, inputs, button;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    loginForm = TestUtils.renderIntoDocument(<NewSession data={data} />);
    inputs = TestUtils.scryRenderedDOMComponentsWithTag(loginForm, 'input');
    button = TestUtils.findRenderedDOMComponentWithTag(loginForm, 'button');
  });

  afterEach(() => {
    sandbox.restore()
  });
});
```

Here I am giving my tests some basic data to work with. I've created my JSON blob that gets passed into the component,
which gives it valid data to start with, we can change this data later when we want a different test scenario, but we always
want to start with valid data.

Next I create a before each block that gets run before each test, and essentially creates the login form, then finds the
submit button and inputs. You'll also notice that I've setup a Sinon sandbox. This allows me to isolate all of my stubs
in each test instance, otherwise the created stubs will have an effect in other tests on down the road. 

#### Some actual testing

##### Basic testing

This is the stuff I was talking about at the beginning of this post. Just testing to make sure that everything was rendered
as expected.

```javascript
  it('should generate a login form', () => {
    expect(inputs.length).to.equal(2);
    expect(button).to.not.equal(null);
  });
```

You can see I'm using the Chai BDD expect style assertions here, which just feels the most comfortable and readable to me,
but with this setup you have options as outlined in the [Chai docs](http://chaijs.com/).

Next I want to test to make sure that an error message is displayed if the email field is left blank:

```javascript
  it('should render an error when the email is invalid', () => {
    let emailInput = inputs.find((el) => { return el.props.name == 'email' }),
        emailError = React.findDOMNode(emailInput).parentNode.querySelector("div.error");

    TestUtils.Simulate.change(emailInput, { target: { value: 'foo' } });

    expect(emailError.innerHTML).to.equal('A valid email address is required');
  });
```

You can see I'm finding the email input, and then finding the dom node that actually holds the error messages. I'm then
using React's nice [TestUtils](https://facebook.github.io/react/docs/test-utils.html) to simulate a change in the value
of that input. Then all I have to do is run the assertion.

The last thing I'd like to touch on is how I'm using stubbing with SinonJS. Here's a couple of examples of testing that a
form validates before submitting:

```javascript
  it('should submit the form when valid', () => {
    let sessionStub = sandbox.stub(sessionActions, "create");

    TestUtils.Simulate.click(button);

    expect(sessionStub).to.have.been.calledWith({ email: "foo@bar.com", password: "foobar" });
  });

  it('should not submit the form when it is not valid', () => {
    let emailInput = inputs.find((el) => { return el.props.name == 'email' }),
        input = React.findDOMNode(emailInput),
        sessionStub = sandbox.stub(sessionActions, "create");

    input.value = 'foo';
    TestUtils.Simulate.click(button);
    
    expect(sessionStub).to.not.have.been.called;
  });
```

The first assertion stubs out the action that is triggered when the submit button is clicked on the form, and simply
expects that it is called with the correct parameters (in the case that the form is valid). In the second test, 
I am specifically changing the value of the input to something that is invalid, and testing that the action was never
triggered.

Testing in this way allows me to isolate my tests in a black box. I don't need to test that when I trigger an action the
store does what it's supposed to, because I am also testing the store.

#### Wrap up

This has been my experience in setting up a testing suite for React components (and Flux). It's probably not perfect, 
but it is what feels the best to me. Like I said before, I haven't seen many posts that go into this level of detail,
so I hope it will be of value to you!

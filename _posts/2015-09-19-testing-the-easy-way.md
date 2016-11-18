---
layout: post
title:  "Testing Components, The Easy Way"
excerpt_separator: <!--more-->
author: Zach Silveira
date: 2015-09-19 21:35
published: true
categories: react, testing
---

You may have seen Darin's post on [testing in React](http://reactjsnews.com/testing-in-react/) last month. We work together at the same company. In the past couple of weeks I've realized that I really *hate* how annoying it is to setup and write tests for components.

<!--more-->

You may have seen Darin's post on [testing in React](http://reactjsnews.com/testing-in-react/) last month. We work together at the same company. In the past couple of weeks I've realized that I really *hate* how annoying it is to setup and write tests for components.

##How We Used To Do Tests

With every new project we start, we have to include jsdom and set that up in a setup.js file that will be ran before each of our tests. If you take a look at [his post](http://reactjsnews.com/testing-in-react/), you'll see that process very clearly. Not only were we including this file in every project, our tests were not easy to follow. Take a look:

```js
it('should generate a login form', () => {
  loginForm = TestUtils.renderIntoDocument(<NewSession data={data} />);
  inputs = TestUtils.scryRenderedDOMComponentsWithTag(loginForm, 'input');
  button = TestUtils.findRenderedDOMComponentWithTag(loginForm, 'button');

  expect(inputs.length).to.equal(2);
  expect(button).to.not.equal(null);
});

```

Even if you're someone who uses the [React Test Utils](https://facebook.github.io/react/docs/test-utils.html) daily, it still takes a second to realize what's going on here. We're rendering the component, finding all the inputs, and finding one button.

##Is There A Better Way?

I thought to myself, "Why isn't there an easier syntax for this?" Welcome to the world of [legit-tests](https://github.com/Legitcode/tests):

```js
Test(<NewSession data={data})
.find('input')
.find('button')
.test(({input, button}) => {
  expect(input.length).to.equal(2);
  expect(button).to.not.equal(null);
})
```
This is the exact same test as above, but so much easier for anyone, even someone new to testing, to reason about. We're testing the `NewSession` component, finding inputs and buttons, then testing them! Not only is this a much nicer syntax, but the library includes `jsdom` and exposes React so that in your test's file you no longer need to setup jsdom, or include React in order to use the jsx syntax in the Test function.

##That's A Pretty Basic Example...

What if you wanted to handle changing the component's state, simulate a click, or change the values of an input field? I built [legit-tests](https://github.com/Legitcode/tests) to be easily extendable. There are a few [built in pieces of middleware](https://github.com/Legitcode/tests/wiki/Bundled-Middleware). Let's take a look at changing the component's state and simulating a click.

```js
let spy = sinon.spy();
Test(<TestComponent onClick={spy}/>)
.use(Find, 'button')
.simulate({method: 'click', element: 'button'})
.setState({test: 'changed!'})
.test(({instance}) {
    expect(spy.called).to.be.true;
    expect(instance.state.test).to.be.equal('changed!')
})

```
Usually I wouldn't recommend chaining too many things together. If I was simulating a click I wouldn't also change the state in that same test, but it's ultimately whatever you prefer.

##How Do I Build My Own Middleware?

If you take a look at the [legit-tests](https://github.com/Legitcode/tests) readme, you can find out more. Here's an example piece of middleware by [geowarin](https://github.com/geowarin/boot-react/blob/frontend-tests/frontend/test/components/LoginPage.spec.js) that changes the value of some inputs:

```js
function ChangeValues(data) {
  let elements = this.helpers.elements[data.elements];
  elements.forEach((element, index) => {
    element.getDOMNode().value = data.values[index];
  });
}

Test(<LoginPage {...props}/>)
.find('input')
.use(ChangeValues, {elements: 'input', values: ['username', 'password']})
.find('form')
.simulate({element: 'form', method: 'submit'})
.test(() => {
  expect(props.login).toHaveBeenCalledWith('username', 'password');
});

```

##What Does This Force Me To Use?

That's a good question! In each test you've seen me reference `expect`. Well the only thing [legit-tests](https://github.com/Legitcode/tests) forces on you is jsdom, React (along with the React Test Utils). We still use Mocha to describe our tests and expect / chai to write our assertions as seen above. You're free to use whatever you like. This library is meant to handle the rendering and testing of your components, the rest is up to you!

##What's Next

I hope this library is as useful for others as it is for me. React 0.14 will be coming out shortly and some things will need to be reworked in the background, but the way the library works now won't be changing. If you have any useful middleware or want to contribute, feel free to send PR's [on github](https://github.com/Legitcode/tests) or leave a comment below.

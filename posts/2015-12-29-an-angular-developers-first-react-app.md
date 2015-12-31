---
layout: post
title:  "An Angular Developer\`s Guide to Their First React Component"
excerpt_separator: <!--more-->
author: Michael Martin
date: 2015-12-30 17:45
published: true
categories: react
---

I\`ve been using Angular in my web apps for the last four years, but I recently became interested in React so I started the learning process. As usual, I dove in blindly, fumbled around with various tutorials until I felt comfortable enough to build something useful. With a few React apps under my belt now, I want to share what I\`ve learned with other Angular developers who may be trying out React for the first time. In this post, I\`ll start from scratch assuming you know nothing about React. I will try to help correlate Angular concepts with their React counterparts so you can start to build a mental model based on something you already know.

<!--more-->

This post originally appeared on my [Angular to React](http://angulartoreact.com/) site where you\`ll find code samples and resources to help get Angular Developers up to speed quickly on React.

I\`ve been using Angular in my web apps for the last four years, but I recently became interested in React so I started the learning process. As usual, I dove in blindly, fumbled around with various tutorials until I felt comfortable enough to build something useful. With a few React apps under my belt now, I want to share what I\`ve learned with other Angular developers who may be trying out React for the first time. In this post, I\`ll start from scratch assuming you know nothing about React. I will try to help correlate Angular concepts with their React counterparts so you can start to build a mental model based on something you already know.


## Getting Started

As I mentioned, my primary goal with this post is to help you build a mental model of a typical React component based on how it correlates with AngularJS. I won\`t dive into setting up your dev environment or installing dependencies. Instead, I\`ve created a JSFiddle that you can use to walk through this entire guide. You probably want to open this [JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/) in a new tab.


## Disclaimer

Very little about React and Angular will be a exact correlation. There are fundamental differences between the two frameworks all the way down to the conceptual level. So, when I express a correlation in this guide between the two frameworks, it is for the sole purpose of helping you build that mental model so that you can start to grasp the basic concepts of React.

While this post may seem to indicate otherwise, don\`t think of Angular and React as an either/or proposition. It is totally feasible to put React components inside of Angular views or to put Angular directives inside of react components. There are times when using one or the other makes more sense, but each should be considered on a case-by-case basis.


## Goodbye Directives. Hello Components.

You\`ve likely built at least one custom directive in Angular. It\`s a convenient way to encapsulate and isolate specific functionality in a way that is testable and resuable. If you set the `restrict` property on the directive to `E` for element, then you can include that directive in your view template as a custom tag like this `<MyDirective />`.

You can think of a React component in the same way. You define your component as a class and then you are able to include it in your JSX code by name using a tag like this `<MyComponent />`. What the heck is JSX? For now, just think of it as an easy way to include HTML-like markup directly inside your native Javascript class. 

*Also, just in case you start to get confused, let me clarify something. A React component has nothing to do with web components and the shadow DOM. That\`s a totally separate concept.*

Let\`s see some actual code. Here\`s the code for a simple React component:

```javascript
var DemoComponent = React.createClass({
  render: function() {
    return (
      <div>
        I am a component.
      </div> 
    ); 
  } 
});
```
[Don\`t forget to follow along in the JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/)

Let\`s break down the code. The React module has a `createClass` method that takes an object as its only parameter. We define only one key to start with: `render`. The value of `render` is a function that returns a virtual DOM element. One of the keys to React\`s performance is its virtual DOM abstraction. Essentially, it calculates the difference between the existing DOM and the new elements to be rendered. Then, it *only* modifies the necessary elements and attributes.

Inside the render function, you may have noticed that I included HTML markup. That\`s JSX. It won\`t pass validation as legal Javascript. Instead, it requires the [Babel transpiler](https://babeljs.io/). For this demo, I have taken care of the transpiling inside the JSFiddle so you don\`t have to worry about it. 

After being hammered with the MVC paradigm, it may seem odd to include HTML inside your native Javascript class. I agree. This threw me for a loop when I first started learning React. I adamantly refused to use JSX and the Babel transpiler. I was wrong. My advice to you: embrace JSX and Babel transpilation. Aside from the benefits of readability and composability, Babel transpilation offers a treasure trove of features and forward-compatibility with ES6. 

#### But what about separation of concerns? This just feels wrong.

I totally understand your trepidation, but which concerns were we actually separating with MVC? In Angular, you had to remember to inject the `$scope` service into your controller. Then, you had to assign your models to `$scope` variables so that you could access them in your view. We\`re exerting extra effort to pass information from our controller to our view. In MVC, the view can do very little without help from the controller. The intent behind *Separation of Concerns*, in my opinion, is to encourage the use of small single-purpose components. Including your UI markup inside your component class using JSX doesn\`t violate this principle, but it *does* make things a little easier for the developer.

In React, the paradigm is slightly different from Angular. Each React component knows how to handle itself, but *only* itself. It knows how to take input and render its own UI. Putting the rendering code inside of the component class really makes sense. If you don\`t agree immediately, I get it. But, just try it out on something tangible (not a demo or tutorial) and see how you feel about it. If you still don\`t like it, JSX is not a requirement. You can build your React components without it.

Time to get on with this walk through.


## Let\`s Set Some Attributes... er... eh... Properties

Once you get over the weird (but strangely familiar) JSX syntax, it is pretty easy to see the correlation between a React component and an Angular directive. The next logical step is to get some data into our new component. In Angular, I often create directives with isloate scopes. To pass values into the directive you use attributes. In React, the concept is similar, but the syntax is a little different. Take a look at some code:

```javascript
var Title = React.createClass({
  render: function() {
    return (
      <h1>{this.props.title}</h1> 
    ); 
  } 
});
```
[Don\`t forget to follow along in the JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/)

That is it for the component definition. React components have a `props` property with key/value pairs for all attributes passed to them through attributes in JSX. To use this component, we just need to supply the value of the `title` property like this:

```javascript
<Title title={myTitle} />
```

Notice that in JSX, you don\`t need any single or double quotations surrounding your property value. You just enclose the `myTitle` variable with a single set of curly braces. Hopefully, this feels a lot like the double curly brace syntax for binding to `$scope` variables in Angular. Just remember, no quotes.


#### Statless Immutable Glory
A key difference between React and Angular at this level is the immutability of properties. A React component should never change the value of `this.props` or any of its keys. Angular doesn\`t have this same restriction in place for directives with isolate scopes. Instead, in Angular you have dynamic data binding that keeps watching the values of `$scope` variables and rendering the changes in your directive in real time.

In React, whenever possible, you should build stateless components with immutable properties. That means that, given the same set of properties and input, the component should:

1. Never change the value of those properties. 
2. Render the exact same UI given the same property values.

When done properly, React will automatically call the `render` function anytime one of those properties is changed by something outside of the component, usually the owner of the component. These types of components are easier to test and have less opportunity to introduce bugs into your code. They are also much easier to map mentally because you can automatically assume that data is only flowing one way... into the component.

However, there are times when immutable properties just aren\`t enough to get the job done. When this happens, there is `state`. If your component needs to keep track of something internally, that may be a good use case for `state`. A good example might be a menu that toggles between open and closed on the click of a button or in response to an event. In this case, the component can create a key in `this.state` that keeps track of the component\`s state. These stateful components should be used only when necessary. Here\`s a sample component:

```javascript
var OnOffButton = React.createClass({
  getInitialState: function() {
    return { value: true }
  },
  handleClick: function() {
    this.setState({ value: !this.state.value });
  },
  render: function() {
    return (
      <button onClick={this.handleClick}>{this.state.value ? "On" : "Off"}</button>
    );
  }
});
```
[Don\`t forget to follow along in the JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/)

Breaking it down, you\`ll notice a few new things. First, the `getInitialState` function. This is part of the React component lifecycle and it gets called once before the component is mounted. It should return an object.

Next, you see the internal state object being referenced using `this.state`. The object that gets returned from `getInitialState` becomes the values of `this.state` inside the React component.

Then, you probably noticed the call to `this.setState`. A React component\`s internal state should only be modified by calls to either `this.setState` or `this.replaceState`. With `setState`, you pass an object in as the first argument and that object is merged into `this.state`. With `replaceState`, it also takes an object as its first argument, but instead of a shallow merge, it completely replaces `this.state` with the new object. Both of these methods will trigger a UI update.

You probably noticed that I also splipped in an onClick event handler. Let\`s walk through that next.

## Wait. What about ngClick?
In the previous example, you probably noticed the use of `onClick`. This closely correlates to the `ng-click` you\`ve grown accustomed to. Notice the camel casing on the event name. This is important because `onclick` will not work. 

React has a synthetic event system that encloses the native browser events inside a cross-browser wrapper to ensure that events work the same in all browsers. For a full list of supported events see [https://facebook.github.io/react/docs/events.html]().

To wire up an event handle, just pass the name of a function as the value of the event attribute, like this:

```javascript
<button onClick={this.handleClick}>Click Me</button>
```

The function needs to be available in the local scope of the React component as referenced by `this`.

## Putting It All Together

As you start combining components together to build an actual application, you\`ll discover that some components need a way state to contain page-level data that is shared among many componets. For example, you might be rendering a blog post. One component needs to display the blog title while another needs to render the body. It wasn\`t obvious to me, at first, how to put together multiple components to create an application. If you\`ve been following along with the [accompanying JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/), you may already have a clue how to do this. First, let\`s look at some code:

```javascript
var App = React.createClass({
  getInitialState: function() {
    return {title: this.props.title}
  },
  handleClick: function() {
    this.setState({title: this.state.title + "."});   
  },
  render: function() {
    return (
      <div>
        <Title title={this.state.title} />
        <DemoComponent />
        <br />
        <OnOffButton />
        <br />
        <button onClick={this.handleClick}>Change Title</button>
      </div>
    );
  }
});
```
[Don\`t forget to follow along in the JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/)

So, this is an all-encompassing component that takes the `<DemoComponent>`, `<Title>`, and `<OnOffButton>` components that we\`ve created through the course of this walk-through and puts them all together into a single `<App>` component. JSX allows us to compose components using other components as tags. So, when we define the `Title` class, we can use that new component inside another component using the `<Title>` tag. 

Ideally, as you build your React apps, you will have a few top-level components that handle fetching data, setting initial state and properties, and listening for events. These are known as controller-views. These top-level components may contain many components. You just pass data down to these *owned* components through immutable properties, keeping most of your components stateless. A controller-view could represent an entire *page* or a major section of a page inside a larger application. For my [Angular to React site](http://angulartoreact.com), I have a single component for every URL even though each of those top-level components are composed of several smaller components. 

## Where Do I Go From Here?

In larger Angular apps, I always used [ui-router](http://angular-ui.github.io/ui-router/site/#/api/ui.router). This allows me to monitor the browser for URL changes and render the appropriate Angular view. In React, the correlating module you\`re looking for is probably [react-router](https://github.com/rackt/react-router). I\`ve used it in a couple of apps. It allows you to map URLs to top-level React components. It is simple to implement, but it supports some advanced routing scenarios like default routes, index routes and nested routes.

Feel free to [fork my JSFiddle](http://jsfiddle.net/michaelishere/52oxac3k/) and experiment with it. You can also check out my [Angular to React site](http://angulartoreact.com) for more React alternatives to common Angular features.

Here\`s a few other posts I\`ve written that might help you get started:

* [What’s the React Equivalent of Angular’s ng-click?](http://angulartoreact.com/ng-click-react-equivalent)
* [Is There a React Equivalent for Angular’s ng-repeat?](http://angulartoreact.com/ng-repeat-react-equivalent)
* [What’s the React Equivalent of Angular’s ng-style?](http://angulartoreact.com/ng-style-react-equivalent)
* [Angular`s ng-if Equivalent In a React Component](http://angulartoreact.com/ng-if-react-equivalent)

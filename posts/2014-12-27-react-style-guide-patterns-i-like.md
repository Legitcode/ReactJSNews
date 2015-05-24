---
layout: post
title:  React Style Guide
date: 2014-12-27 16:19
published: true
categories: react
---
The idea of "idiomatic" React hasn’t been explicitly written on, so I thought I’d offer some conventions that my team at Tune has been using during the past few months of adoption. For the sake of this article, scope will be limited to coding style in React components - not styling, componentization, or Flux strategies. Also, this is meant to be a living document - and I am sure there are better ideas out there - so any comments and feedback are more than welcome.

## Method Organization

We lay out a component’s methods generally based on the order of its lifecycle methods:

```
React.createClass({
  displayName : '',
  propTypes: {},
  mixins : [],
  getInitialState : function() {},
  componentWillMount : function() {},
  componentWillUnmount : function() {},
  render : function() {}
});
```

Setting a displayName will help with debuggable warnings when developing - I like putting that at the very top, followed by propTypes and mixins. PropTypes are particularly useful for explicitly documenting your expectations for how the component is to be used, in addition to adding validation on incoming props.

If you have custom functions, I prefer to preface these with an underscore to differentiate them from methods that are a part of React's API. I typically place them immediately above the render function.

```
React.createClass({
  displayName : '',
  propTypes: {},
  mixins : [],
  getInitialState : function() {},
  componentWillMount : function() {},
  componentWillUnmount : function() {},
  _onChange : function() {},
  _onCreate : function() {},
  render : function() {}
});
```

I originally thought custom functions should be placed underneath the render method, but pragmatically, it is much easier to always be able to scroll to the bottom of a file and expect to see the render every time.

As much as I can, I also prefer for all of the component's JSX to be located in that render method.

## Conditional HTML

It is worth repeating that, in JSX, anything in {} among HTML will be evaluated as JavaScript. So if you want to render something simple conditionally, you can use the same conditions or ternaries as you typically would in JavaScript:

```
{this.state.show && 'This is Shown'}
{this.state.on ? ‘On’ : ‘Off’}
```

For anything more complicated, I have typically been creating a variable inside the render method, suffixed with 'Html':

```
var dinosaurHtml = '';
if (this.state.showDinosaurs) {
  dinosaurHtml = (
	<section>
	  <DinosaurTable />
	  <DinosaurPager />
	</section>
  );
}

return (
  <div>
	...
	{dinosaurHtml}
	...
  </div>
);
```

## JSX as a Variable or Return Value

JSX spanning multiple lines should be wrapped in parentheses like so:

```
var multilineJsx = (
  <header>
	<Logo />
	<Nav />
  </header>
);
```

JSX spanning a single line can disregard the parentheses,

```
var singleLineJsx = <h1>Simple JSX</h1>;
```

but anything complicated or with a likeliness of expanding could be wrapped in parentheses for readability/convenience.

## Self-Closing Tags

Components without children should simply close themselves, as above with Logo,

```
<Logo />
```

as opposed to the unnecessarily more verbose

```
<Logo></Logo>
```

## List Iterations

I used to do my list iterations like above in dinosaurHtml. I've realized that list iterations are better done inline, especially if each list item will be rendered as a component. You may even be able to reduce to one line with fat arrows:

```
render : function() {
  return (
	<ul>
	  {this.state.dinosaursList.map(dinosaur => <DinosaurItem item={dinosaur} />)}
	</ul>
  );
}
```

This does require the harmony flag on JSX to be included, which will toggle certain ES6 features (fat arrows, template strings, destructuring, and rest parameters), listed here: http://kangax.github.io/compat-table/es6/#jsx. If you're incurring the cost of JSX compilation, you might as well also incur the cost of ES6 transpilation as well, using either the JSX harmony flag or a separate ES6 transpiler (we use 6to5).

## Forms

For storing the form state within the component or something external like a Flux store, one should typically use the LinkedStateMixin from React Addons or write your own handler(s) respectively. Using the LinkedStateMixin is fairly straightforward, documented [here](http://facebook.github.io/react/docs/two-way-binding-helpers.html). If you went with a handler to store in Flux, you could write one abstractly and then curry it for each field, like so:

```
<input type="text" value={this.state.newDinosaurName} onChange={this.inputHandler.bind(this, 'newDinosaurName')} />
```

where inputHandler looks something like:

```
function(fieldName, event) {
  actions.propagateValue({
    field : fieldName,
    value : event.target.value
  });
}
```

An even better pattern, though, was offered by @insin on the [Hacker News thread](https://news.ycombinator.com/item?id=8811617), noting that instead of placing an onChange handler on every form input, you really only need one handler on the form, like so:

```
<form onChange={this.inputHandler}>
  ...
	<input type="text" name="newDinosaurName" value={this.state.newDinosaurName} />
  ...
</form>
```

where inputHandler looks like:

```
function(event) {  
  actions.propagateValue({
	field : event.target.name,
	value : event.target.value
  });
}
```

[Correction: This article had originally said that I thought uncontrolled form fields may be preferable to controlled form fields that are directly controlled by the state. This opinion was mostly unqualified - I now think it advantageous for form fields to correspond to state values and to avoid pointless DOM access.]

## Formatting Attributes

Instead of the long input element above, a cleaner and easier indentation would be:

```
<input
  type="text"
  value={this.state.newDinosaurName}
  onChange={this.inputHandler.bind(this, 'newDinosaurName')} />
```

as opposed to aligning attributes after the tag,

```
<input type="text"
       value={this.state.newDinosaurName}
       onChange={this.inputHandler.bind(this, 'newDinosaurName')} />
```

which is still more readable than no indentation, but takes a little more attention than it should.

## Closing

These are a handful of patterns that we've found useful in writing React, and should by no means be considered authoritative at this point. If you have contradicting ideas, please offer them in the comments as this sort of discussion is beneficial for the React ecosystem as a whole.

I would love to see other style guides emerge to address styling, componentization (including when to use mixins, considerations between props and state, and communication strategies), and Flux.

Thanks for reading!
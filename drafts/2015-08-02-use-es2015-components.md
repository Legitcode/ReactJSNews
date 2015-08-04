---
layout: post
title:  "Why ES2015 Classes are "Good Enough""
excerpt_separator: <!--more-->
author: Zach Silveira
date: 2015-07-29 14:00
published: false
categories: react, alt
---

It's been months since React has supported ES2015 classes. Since then there have been many issues and problems compared to using `React.createClass`.
Is it time for you to switch?
<!--more-->
Is there a reason to? Maybe, maybe not. That's up to you. Ryan Florence's take on switching is:

<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/ReactJSNews">@ReactJSNews</a> &quot;you should switch because you want to look cool and argue about mixins&quot; :P</p>&mdash; Ryan Florence (@ryanflorence) <a href="https://twitter.com/ryanflorence/status/627985314393382912">August 2, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Here’s my take on this: In the large scheme of things, it doesn’t matter that much. For most of the cases out there, the difference between React.createClass and class X extends React.component is that of syntax. If you don’t use mixins or decorators often, just choose the syntax you like the best.

But apart from that, there are some real reasons to choose one way over the other.

There are some real features you lose by going with ES6 Classes (I’m not going to say ES2015, you can’t make me!) — namely mixins, autoBound functions and the oft-forgotten this.isMounted method. ES6 classes also means you now have a hard dependency on a tool like Babel. If you’ve not embraced JSX, and are currently writing ES5 code that doesn’t need transpilation, this might be a dealbreaker for you.

But before we get into the pros and cons list, let say something that people tend to overlook. Using ES6 classes instead of React.createClass DOES NOT make your code any more or less Object oriented. It’s just a different syntax for defining classes folks, it has a fewer features, but essentially you’re moving from a factory pattern to a constructor pattern. So, if you like your code nice and functional, this should be a non-debate for you.

On the flip side, using ES6 classes does make it easier to do inheritance. But please, don’t. Let me put it this way, if you’re going to use ES6 classes just so you can make deep inheritance chains, just stick to React.createClass and write some mixins.

## Why you may prefer React.createClass

### "I like auto-binding functions"

This is a valid argument, except you **can** autobind with ES2015 classes, (See the [React blog post](https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding))

Using Babel stage: 0 (which I’m personally a huge fan of) you can write your classes like this:

~~~js
class Counter extends React.Component {
  tick = () => {
    ...
  }
  ...
}

~~~

If you think stage:0 is way too extreme, there are other options out there. You can, for example, use an autobind decorator: https://github.com/andreypopp/autobind-decorator

But, decorators are a stage: 0 feature, I hear you say. Yes, but you don’t need stage:0:

~~~js
class Counter extends React.Component {
  tick() {
    ...
  }
  render(){
    ...
  }
  ...
}

export default autobind(Counter)
~~~

### "I like mixins”

This is pretty much the main reason people are sticking to React.createClass, and for good reason. There are large React code bases that rely on mixins. React-router, for example, gets a lot of power by using mixins.
Again, you can use [React-mixin](https://www.npmjs.com/package/react-mixin), to use mixins with ES6 classes, but you may be getting annoyed by the decorators by now.

### Little things like this.isMounted

You hardly ever need to use them, and when you do, they are easy to add.

### Why you should switch

### autobinding what?
Maybe this is stockholme syndrome, but we’ve been dealing with context issues in Javascript so long, that it’s starting to feel right. The automatic autobinding that React.createClass can be confusing to beginners, and the implicit nature of the binding can be confusing even after months for some.
ES6 classes, makes you explicitly bind your methods. Which makes everything clearer, and will help developers new to React grok what’s going on.

### Move over Mixins, use Higher-Order-Components
Go to any conversation about ES6 classes, and you’ll find someone telling you to use composition over inheritance. You may have seen this meme before:
https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRW8W5l3CTR2UAHMvtdvCT-hyJc3Od5gJnyXyS6qrQQDXWLPevMkr164v_S

The fact is that inheritance is a terrible way to code. It’s error-prone, clunky and hard to understand. It can lead to extremely brittle code, and forces you to write all your code the same way. Mixins are definitely a much better solution, but developers still tend to abuse them to do things that could simply be done with composition. Who said you can’t be functional with classes? As an added bonus, Higher-Order-Component will work with both kinds of classes, and will be forward compatible with pure functions.

On the other hand, using decorator functions, you can do some very powerful things with ES6 classes, such as polyfill the oft-discussed polyfill API. This power should be used sparingly, but when you do need it, it’s nice to have.

### No Cruft
Getting rid of features such as this.isMounted which is rarely used in practice helps React be lighter and more nimble. Over time this is also helping React be faster. I know we all love React, but we also want to keep winning the speed tests, don’t we.
### FlowTypes
This is one is near and dear to my heart. For a very long time, I’ve pretty much ignore Typescript and Flow, but after losing a whole day to a typo in an event name, I started using flow in my code and I haven’t looked back. Flow lets you embrace it slowly on a file-by-file basis, and even though it may make you jump through hoops sometimes to work around errors, it will find a whole bunch of subtle errors that you didn’t even know existed.

But what does this have anything to do with ES6 class syntax? Flowtype (and typescript) are much easier to use if you’re using ES6 classes.

This is how you can annotate properties in an ES6 class:

~~~js
Class X extends React.Component {
  someProp: string | number;
  state: SomeType;
  props: SomeType;
  ...
}
~~~

The same is a little more complicated with React.createClass
~~~js
React.createClass({
  someProp: (0: string | number),
  ...
})
~~~

You can’t even define types for props and state with flow with React.createClass. Instead, flow depends on a huge amount of custom code to figure out the types for props by looking at propTypes. In practice, it never works that well. And type checking state is simply not even possible.


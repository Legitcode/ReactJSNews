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


With that being said, before I get started let me begin by saying I'm a big proponent of Babel's `stage 0`. This is definitely a highly debatable topic.
I've been using decorators and property initializers in my components for the past couple months.
Yes, I am banking on the fact that these things actually get put in to the next release (ES2016?) but I feel like the features
I'm using almost certainly will become a standard. I'll be writing this from the perspective of someone arguing with me, as you can see below.

### "I like auto-binding functions"

This is a valid argument, except you **can** autobind with ES2015 classes, (See the [React blog post](https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding))

~~~js
class Counter extends React.Component {
  tick = () => {
    ...
  }
  ...
}

~~~

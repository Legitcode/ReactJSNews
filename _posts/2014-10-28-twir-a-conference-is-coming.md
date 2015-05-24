---
layout: post
title:  "TWiR: A Conference is Coming!"
excerpt_separator: <!--more-->
author: Zach Silveira
date: 2014-10-28 13:05
published: true
categories: react
tags: twir
---
##ReactJS Conf!
In this second installment of _This Week in React_ we've got some awesome news! [React Conf](http://conf.reactjs.com/) is coming January 28-29. If you're interested in becoming a presenter, you can apply [here](http://conf.reactjs.com/call-for-presenters.html). 

<!--more-->

##ReactJS Conf!
In this second installment of _This Week in React_ we've got some awesome news! [React Conf](http://conf.reactjs.com/) is coming January 28-29. If you're interested in becoming a presenter, you can apply [here](http://conf.reactjs.com/call-for-presenters.html). 

You probably don't care, but I'll be going (along with hopefully the rest of the ReactJSNews team). I plan on blogging throughout the conference, this way you can experience some of the talks if even if you can't make it. The best part is going  meeting some of the React community!

##What's new this week?

I always encourage people to tweet me [@ReactJSNews](http://twitter.com/reactjsnews) with any of their creations. It's an easy way to get your stuff out there. 

First up, we've got the [biggest React resource](https://github.com/enaqx/awesome-react) I've ever seen. As of writing this, it's peaked at [#10 on hackernews](https://news.ycombinator.com/item?id=8515192). Check it out if you're looking to learn literally anything dealing with React. Take my word for it, it's probably there.

####Components
The first component we've got is a [custom number input field](https://github.com/tleunen/react-number-editor) made by [@Tommy](http://twitter.com/Tommy). It seems to act like a hybrind input / slider field. The component has quite a few options, the example given can be seen here:

~~~
<NumberEditor min={0} max={1} step={0.01} decimals={2} onValueChange={onValueChange} />
~~~

You can find all the options [on github](<(https://github.com/tleunen/react-number-editor>).

[**Domain Driven Forms**](https://github.com/gcanti/tcomb-form)  by [@GiulioCanti](https://twitter.com/GiulioCanti) is an awesome library for generating html forms through javascript. Creating a form is just too easy: 

~~~js
var t = require('tcomb-form');

// define a type
var Person = t.struct({
  name: t.Str,
  surname: t.Bool
});

// create the form
var Form = t.form.createForm(Person);
~~~

Now that for form is created all you need to do is reference it in a React component: `<Form />`. 

[**React Select**](https://github.com/JedWatson/react-select) is another form based component. I just realized that every component being featured this week deals with forms! That wasn't planned, I swear! Anyways, this component aims to make generating select boxes easier. I like that it makes asynchronously addding options easy. Here's an example with async enabled:

~~~js
var getOptions = function(input, callback) {
    setTimeout(function() {
        callback(null, {
            options: [
                { value: 'one', label: 'One' },
                { value: 'two', label: 'Two' }
            ],
            complete: true
        });
    }, 500);
};

<Select
    name="form-field-name"
    value="one"
    asyncOptions={getOptions}
/>
~~~

##React Articles
[Easier UI Reasoning with Unidirectional Dataflow and Immutable Data](http://open.bekk.no/easier-reasoning-with-unidirectional-dataflow-and-immutable-data)

[Why you might not need MVC with React.js](http://www.code-experience.com/why-you-might-not-need-mvc-with-reactjs/)
##Cool Links

[Embedded SVG icon sets and Reactjs](https://github.com/tleunen/react-number-editor)

[Glenjamin's favorite NPM modules](https://github.com/glenjamin/node_modules/wiki)

[Bitcoin Sidechains](http://avc.com/2014/10/sidechains/)

[Verizon Wireless injecting tracking UIDs into HTTP requests](https://news.ycombinator.com/item?id=8500131)

[Immutable JS](https://github.com/facebook/immutable-js)

[Strengthening 2-Step Verification with Security Key ](http://googleonlinesecurity.blogspot.com/2014/10/strengthening-2-step-verification-with.html?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+GoogleOnlineSecurityBlog+%28Google+Online+Security+Blog%29)

[FFS SSL](http://wingolog.org/archives/2014/10/17/ffs-ssl)

[How do you communicate if you won't hit an estimate?](https://news.ycombinator.com/item?id=8482673)

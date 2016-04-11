---
layout: post
title:  "How to Make Your React Apps 10x Faster"
date:   2016-04-07 17:00
excerpt_separator: <!--more-->
author: Freddy Rangel
published: true
categories: react, performance, webpack, babel
---

Without any modifications, React is really fast. However, there are a few things you can to improve performance. I work at HelloSign, where I quickly discovered some quick fixes which made our apps incredibly snappy. With these changes, I was able to reduce render time from over 3000 milliseconds to less than 200 milliseconds.

<!--more-->

Without any modifications, React is really fast. However, there are a few things you can to improve performance. I work at HelloSign, where I quickly discovered some quick fixes which made our apps incredibly snappy. With these changes, I was able to reduce render time from over 3000 milliseconds to less than 200 milliseconds.

**Editor's Note:**

Check out our upcoming [workshops](http://www.reactuniversity.com/training). Our next workshop is [React 2016](http://www.reactuniversity.com/react-2016 "React 2016") on April 23 in San Francisco. It's a deep dive into creating modern Single-Page Applications (SPA) using React, Redux, React Router, Immutable.js, and Webpack. We also have a workshop coming up called [React and D3](http://www.reactuniversity.com/react-and-d3) which teaches how to get React and D3 to play together to build awesome data visualizations.

## Introduction

HelloSign is a cloud based electronic signature tool founded in 2010. As you can imagine, HelloSign is a very JavaScript heavy codebase. A lot of client-side behavior is necessary to create a rich signing experience. Lately, we've moved a lot of our codebase toward React. In many places, we've broken up our codebase to be several single page applications written in React.

We were happy with the performance we were getting out of React before I initially came on the team. Once I joined HelloSign, I quickly found some low hanging fruit we needed to take in terms of performance. Here are the steps you should take to see similar performance improvements in your applications.

## Create a Baseline Performance Measurement

Before you do anything, you need to take a baseline measurement. Optimizations are meaningless if you can't verify the results of optimizations.

Thankfully, Chrome has excellent developer tools for this purpose. One little used feature of Chrome's DevTools is the "Timeline" tool. It allows you to record and analyze all activity in your application. You can record interactions on the page and see where your potential memory leaks are, total time it takes to perform a task, or areas of potential [jank](https://developers.google.com/web/fundamentals/performance/rendering/?hl=en). Best of all, since you can record this you can compare it with your final benchmark once you're finished.

There's actually a really awesome video on Chrome's DevTools which goes into the "Timeline" feature as well. You can view it [here](http://forwardjs.com/university/real-time-performance-audit-with-chrome-devtools).

The area we choose to measure is time from initial paint to the entire page being rendered. The initial download of our bundles still needs some optimization, but we're not going to mess with that nor measure it. It's fairly easy and consistent to test render time rather than trying to click areas around the page and try to measure its performance in a repeatable way. Then all we needed to do is go to the page, open Chrome's DevTools "Timeline" tab, and refresh the page.

As a side note, make sure that when you're performing this test to check the "Paint" and "Screenshots" checkboxes so you can see what the user sees as the page is being rendered.

After all that, we determined that our rendering time from initial pain was a little over 3 seconds. That is way too long. Luckily, there was little we had to do to make this a lot faster.

![Performance Benchmark 1](https://reactjsnews.com/img/10x-react-performance/performance-benchmark-1.png)

## Set NODE_ENV to Production

This is very easy to get wrong even if you know about this. React's [documentation](https://facebook.github.io/react/downloads.html#npm) touches on this a little bit, but doesn't go too much into specifics. React has great developer warnings and error checking, but these are only intended for development. Taking a look at React's source code, you'll see a lot of `if (process.env.NODE_ENV != 'production')` checks everywhere. This is running extra code that is not needed for the end user, not to mention that calling `process.env.NODE_ENV` is extremely slow. For production environments, we can remove all this unnecessary code. Keep in mind that you don't want to do this in development otherwise you lose all those helpful developer warnings.

If you're using [Webpack](https://webpack.github.io/) you can use [DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin) to replace all instances of `process.env.NODE_ENV` with "production", and then use the [UglifyJsPlugin](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) to remove all the dead code that will no longer run. Here's a sample setup you might use:

```javascript
// webpack.config.js
  ...
  plugins: [
    new webpack.DefinePlugin({
      // A common mistake is not stringifying the "production" string.
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
  ...
```

## React Constant and Inline Elements Transforms

React 0.14 introduced support for certain transpile time optimizations with [Constant and Inline Element Babel Transforms](https://github.com/facebook/react/blob/master/CHANGELOG.md#new-features). [React Constant Elements](http://babeljs.io/docs/plugins/transform-react-constant-elements/) treats JSX elements as values and hoists them to a higher scope. Essentially it will hoist elements that are static, reducing calls to `React.createClass`. [React Inline Elements](https://babeljs.io/docs/plugins/transform-react-inline-elements/) converts JSX elements into the object literals they eventually return. Again, this minimizes the runtime calls to `React.createClass`.

The implementation is rather simple. We added our Babel configuration in our `package.json` file:

```javascript
// package.json
  ...
  "babel": {
    "env": {
      "production": {
        "plugins": [
          "transform-react-constant-elements",
          "transform-react-inline-elements"
        ]
      }
    }
  },
  ...
```

## Final Measurement / Conclusion

Lastly, you'll want to run the benchmark again and compare it with the saved benchmark from before these optimizations. As you can see, the total runtime profile ends after 200ms after initial paint!

![Performance Benchmark 2](https://reactjsnews.com/img/10x-react-performance/performance-benchmark-2.png)

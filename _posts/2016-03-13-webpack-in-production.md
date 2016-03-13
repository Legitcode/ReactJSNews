---
layout: post
title:  "React Router & Webpack in Production"
date:   2016-03-13 17:00:09 +1300
excerpt_separator: <!--more-->
author: Zach Silveira
published: true
categories: react, webpack
---

I've been working on a pretty large [react-router](https://github.com/reactjs/react-router) codebase at work. Currently it has around 50~ code splits, which as you can imagine, is a lot of routes. This is going to be a post on the things I've learned throughout building out my development / production config and how we are using webpack in production. 

<!--more-->

###Initial Setup

Before I really dive into how my webpack config is setup and the problems I've found, I'll quickly go over how this app is setup. Currently, there's one entry point and it looks like this:

```js
import React from 'react'
import { render } from 'react-dom'
import { match, Router, browserHistory } from 'react-router'
import AsyncProps from 'async-props'
import routes from '../routes/index'
/* globals document, window */

const { pathname, search, hash } = window.location
const location = `${pathname}${search}${hash}`

match({ routes, location }, () => {
  render(
    <Router
      render={props => <AsyncProps {...props}/>}
      routes={routes}
      history={browserHistory}
    />,
    document.getElementById('app')
  )
})

```

It looks like a standard react-router setup, except a couple things are different. For one, there's way too many routes to have them all in this file, so we are importing the main route object into this file. Second, we are using `match` on the client side. Without matching first, the client side would try to render before the splits were downloaded causing an error. You can read a little more about match on the client [here](https://github.com/reactjs/react-router/issues/1990#issuecomment-141350392). 

Next, we are using Ryan Florence's awesome [async-props](https://github.com/ryanflorence/async-props) library for loading data into components. It allows me to load data from an api before the server renders components. It will pass the data down to the client for the client-side render, and then data will load as you navigate to new pages automatically.

###Routes

Our main routes file looks like this:

```js

export default {
  component: 'div',
  path: '/',
  indexRoute: require('./index'),
  childRoutes: [
    require('./login'),
    require('./account'),
    ...
  ]
}
```

There's a lot more require's in our app of course. And these are nested pretty deep. The files referenced in the root file have more child routes, and those use 
`require.ensure` which you can read about in the webpack docs on [code splitting](https://webpack.github.io/docs/code-splitting.html). It tells webpack to make a new bundle, and then load that bundle when require.ensure is called on the client. Here's an example:

```js
if(typeof require.ensure !== "function") require.ensure = function(d, c) { c(require) }

module.exports = {
  path: 'account',
  getComponent(location, cb) {
    require.ensure([], (require) => {
      cb(null, require('../../views/master/index.jsx'))
    })
  },
  childRoutes: [
    require('./settings'),
  ]
}
```

There's a few things going on here. First, we have a function at the top that will polyfill `require.ensure`. Why? Well, on this project we are server rendering our whole site as well, which I would rather not do, but due to the type of site we are building: we have to. The next thing is the relative require path. I'm using this awesome [babel resolver plugin](https://github.com/jshanson7/babel-plugin-resolver) along with webpack's [resolve paths](https://webpack.github.io/docs/configuration.html#resolve) so that I can import files like this:

```js
import Header from '../../master/header'
//becomes
import Header from 'master/header'

```

Why do I have to use a babel plugin AND webpack's resolve feature? Once again, doing a server rendered app, the code is ran on the server and also through webpack. In this particular app, I haven't had time to experiment with [webpacking the server](https://github.com/webpack/react-webpack-server-side-example). Anyways, if I didn't use the babel plugin, errors would be thrown on the server, but webpack would work fine. This is one of the common things I have ran into while building this app. 

Realizing some things need to be done slightly different on the server or client. You may still be wondering why I am referencing the component as a relative path in the above route example, and that's because the babel plugin I'm using only works with `import` and not `require`. My route objects are the one place that I have these "nasty" looking paths.

##Webpack 

I was prompted to make this article after tweeting this out:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">webpack splits vs AggressiveMergingPlugin({minSizeReduce: 1.0}) <a href="https://t.co/b6kxHEqNcO">pic.twitter.com/b6kxHEqNcO</a></p>&mdash; ReactJS News (@ReactJSNews) <a href="https://twitter.com/ReactJSNews/status/707970197563506688">March 10, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

A couple people wanted a better explanation as to what's happening here. When I was first building my production webpack config, even after using all of these plugins:

```js
new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
new webpack.optimize.OccurenceOrderPlugin(),
new webpack.optimize.DedupePlugin(),
new webpack.optimize.UglifyJsPlugin({
  compress: { warnings: false },
  comments: false,
  sourceMap: false,
  mangle: true,
  minimize: true
}),

```

My bundle looked like this:

![Webpack Output](http://reactjsnews.com/img/webpack-production/before.png)

That's pretty huge if you think about it. And I'm not talking about the amount of bundles. I'm talking about the file size. After searching everywhere for a solution to get the bundle size down further, I found webpack's [AggressiveMergingPlugin](https://webpack.github.io/docs/list-of-plugins.html#aggressivemergingplugin). This thing is a life saver. As you may have seen from the tweet, the output turns into this:

![Webpack Output](http://reactjsnews.com/img/webpack-production/after.png)

Just having the main, vendor, and one other bundle brings the whole site under 1MB. I'm using the plugin to only merge files if the size reduction is more than 50%, which is the default. 

People talk about code splitting in webpack and think it's really amazing to load the JS for the page you're on and nothing more. It sounds great. The problem is that the file size is immensely bigger. If someone more familiar with webpack has a better idea as to why this is, I'd like a better explanation. It isn't feasable to keep the splits instead of merging them. This site is pretty large, with a lot of routes as you can tell from the screenshots. Codesplitting without merging would cause way more waiting on the client side every time you navigate to a new page. Even if the JS was heavily cached, the first time you hit these pages it will have to load a 300kb bundle for some of them.

##Caching

That takes us to caching. We are about a month away from publicly launching this site, so we haven't setup the workflow for pushing updates through a cdn, but that will be the end result. For now, in my webpack config, my output object looks like this:

```js
output: {
  path: __dirname + '/public/assets/js/[hash]/',
  filename: '[name].js',
  chunkFilename: '[id].js',
  publicPath: '/assets/js/[hash]/'
},
```

This is in the production config of course. This way I can cache the files and when I update the code, the hash will change and the browser won't be caching the old code. I pass in the hash as an env variable at runtime to that the server has the correct path to the assets folder.


##Conclusion

I hope this gave you a good glimpse at how webpack and react router work at a larger scale than you see most blog posts cover. If you have any questions or things that you would like me to talk about that I haven't already, please leave a comment below and I will update this post!

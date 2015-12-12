---
layout: post
title:  "The Pain and the Joy of creating isomorphic apps in ReactJS"
excerpt_separator: <!--more-->
author: Viktor Turskyi
date: 2015-12-12 00:30
published: true
categories: react, redux, isomorphic
---

This post is not a tutorial. There are enough of them on the Internet. It is always more interesting to look at a real production app. A lot of tutorials and boilerplates show how to write isomorphic ReactJS applications, but they do not cover a lot of real-life problems we've faced in production (styling, data-fetching, vendor-prefixes, configutation etc). So we decided to share our experience at github and develop the app in a [public repo](https://github.com/webbylab/itsquiz-wall). The post describes all the issues and howto to deal with them. Originally it appeared on the [koorchik's blog](http://blog.koorchik.com/isomorphic-react/).

<!--more-->

## Preface

Let's start with the term "Isomorphic application". An isomorphic application is just a regular single page application that can be run on server. I do not like the word "isomorphic", I believe that programmers should struggle complexity (not only in code) and the word "isomorphic" сomlicates understanding, therefore it increases complexity :). There is another name for isomorphic JavaScript - "Universal JavaScript", but in my opinion the word "Universal" is too general. So, in this post, I will use the word "isomorphic" ( even if do not like it :) ).

How do people see an isomorphic app? You can find diagramms in the internet like this one:

![](http://blog.koorchik.com/isomorphic-react/isomorphic_separated.png)

But ideally it should look a little bit different:

![](http://blog.koorchik.com/isomorphic-react/isomorphic_joined.png)

I mean, not less than 90% of your code should be reused. In large apps it can be even more than 95%.

This article is not a tutorial. There are enough of them on the Internet. It is always more interesting to look at real production app. A lot of tutorials and boilerplates show how to write isomorphic ReactJS applications, but they do not cover a lot of real-life problems we've faced in production. So we decided to share our experience at github and develop the app in a public repo. Here is [the running app](http://itsquiz.com/en/activations) and here is [its code](https://github.com/webbylab/itsquiz-wall).

**IMPORTANT**: This is real-world application, so it is always evolving. Our goal is to make working product within a limited amount of time. Sometimes, we have no time for finding the best possible solution, but use just suitable variant in our case.

If you want to develop isomorphic app from scratch, then start with reading this tutorial ["Handcrafting an Isomorphic Redux Application (With Love)"](https://medium.com/@bananaoomarang/handcrafting-an-isomorphic-redux-application-with-love-40ada4468af4). It is really great!

## About the app

In [WebbyLab](http://webbylab.com) we use React from the moment it was open sourced by Facebook almost in every our project. We've created keynote clone, excel clone, a lot of hybrid mobile applications, UI for a social monitoring system, comment moderation system, ticket booking system, a lot of admin UIs and more. Sometimes we make isomorphic apps too. The fundamental difference between regular SPA and isomorphic SPA is that in isomorphic SPA you will process several requests simultaneously, therefore you should somehow deal with a global user-dependent state (like current language, flux stores state etc).

[itsquiz.com](http://itsquiz.com/en/activations) is one of our projects written in ReactJS. itsquiz.com is a cloud testing platform with a lot of amazing features. And one of the key features of the product is a public quizzes catalogue (aka "quizwall"), any user can publish his own tests there and pass others'. For example, you can go there and [test your knowledge of ReactJS](http://itsquiz.com/en/activations/5660a8795b8300236895bef5).

*You can watch 1 minute promo video to better understand the idea of the product:*

<a href="http://www.youtube.com/watch?feature=player_embedded&v=eiougg2UhYA
" target="_blank"><img src="http://img.youtube.com/vi/eiougg2UhYA/0.jpg"
alt="IMAGE ALT TEXT HERE" width="480" height="320" border="10" /></a>

Here are key requirements to Quizwall:

1. Content is available without authorization.
2. It should be indexable by search engines.
3. It should have social networks sharing features.
4. It should support different languages.
5. It should work fast

Writing isomorphic application is the simplest and the most suitable solution in this case.

## What parts of your app should be isomorphic?

1. Isomorphic view
2. Isomorphic styles
3. Isomorphic routing
4. Isomorphic data fetching
5. Isomorphic configuration
6. Isomorphic localization

Let's go one after another.

### Isomorphic view (Joy #1)

This is the simplest part. It is simple because Facebook developers solved this problem already in ReactJS. The only thing we should do is to take React Js library and use it according to documentation.

Client code:

```javascript
import ReactDOM from 'react-dom';
import App      from './App';

ReactDOM.render(
    <App />,
    document.getElementById('react-view')
);

```

Server code:

```javascript


import ReactDOM from 'react-dom/server';
import App      from './App';

const componentHTML = ReactDOM.renderToString(
    <App />
);

const html = `
    <html>
        <head>
            <title>Quiz Wall</title>
        </head>
        <body>
            <div id="react-view">${componentHTML}</div>
        </body>
    </html>
`;

res.end(html)
```

As you see, we just use "ReactDOM.renderToString" instead of "ReactDOM.render". That's it. Nothing complex and you can find this in any tutorial.

### Isomorphic styles

Usually tutorials omit this. And this is the first place where you start to feel pain ;).

#### Pain #1: styles import

We use webpack and usually we import component specific styles in component itself. For example, if we have a component named "Footer.jsx" then we will have less file named "Footer.less" in the same folder. And "Footer.jsx" will import "Footer.less". The component will have class by its name ("Footer") and all styles will be namespaced by this class.

Here is a small example:

```javascript
import React from 'react';
import './Footer.less';

export default class Footer extends React.Component {
    render() {
        return (
            <div className='Footer'>
                <small>
                    Developed by
                    <a href='http://webbylab.com' target='_blank'>
                        WebbyLab
                    </a>
                </small>
            </div>
        );
    }
}

```


Such approach makes our code more modular. Moreover, if we import a component it will automatically import its dependencies (js libs, styles, other assets). Webpack is responsible for handling all file types. So, we have self-contained components.

This approach works great with webpack. But it will not work in pure nodejs, because you cannot import "less" files. So I've started looking for a solution.

The first possible one was [require.extensions](https://nodejs.org/api/globals.html#globals_require_extensions) but
1. Feature stability: 0
2. Status: "deprecated"
3. Does not work with babel-node. I am not sure why, more investigation required.

So, I've started looking for another solution. The simplest one was using inline styles.

**Inline styles** .

I've decided to try inline styles because:

1. Inline styles have no problems with server side import. They can be saved in json files.
2. [React supports inline styles](https://facebook.github.io/react/tips/inline-styles.html)
3. Inline styles solve a lot of CSS issues without hacks - [React: CSS in JS by vjeux](https://speakerdeck.com/vjeux/react-css-in-js)

There are several issues I've faced using them:
1. You should emulate pseudo css attributes like :hover, :active, :focus with JavaScript.
2. You should manage vendor prefixes by your own
3. You should emulate media queries with JavaScript
4. You need to merge styles some way. (with css you usually just mention several classes names)

I've found a great tool for working with inline styles called [Radium](http://projects.formidablelabs.com/radium/). It is great tool which solves all mentioned issues if you develop SPA.

#### Pain #2: automatic vendor prefixing based on browser DOM

We've switched to Radium but when we run our application in isomorphic mode we received strange warnings.

![](http://blog.koorchik.com/isomorphic-react/markup-error.png)

"React injected new markup to compensate which works but you have lost many of the benefits of server rendering." No, I want all the benefits of server rendering. We run the same code on a server and a client, so why react generates different markup? The problem is with Radium automatic vendor prefixing. Radium creates DOM element to detect list of css properties that should have vendor prefixes.

Here is the issue on Github ["Prefixing breaks server rendering"](https://github.com/FormidableLabs/radium/issues/201). Yes, there is a solution for it now: using Radium's autoprefixer on client side and detect browser by user-agent and insert different prefixes (with [inline-style-prefixer](https://github.com/rofrischmann/inline-style-prefixer)) for requests from different browser on server. I tried, but that time the solution was not reliable. Maybe now it works better (you can check it by your own :)).

The second problem is that you cannot use media queries. Your server does not have any information about your browser window size, resolution, orientation etc. Here is a related issue https://github.com/FormidableLabs/radium/issues/53.

**Solution that works**

I've decided to switch back to [less](http://lesscss.org/) and [BEM](http://getbem.com/) but with condititional import.

```javascript
import React from 'react';

if ( process.env.BROWSER ) {
    require('./Footer.less');
}

export default class Footer extends React.Component {
    render() {
        return (
            <div className='Footer'> </div>
        );
    }
}

```

You see that we are using "require" instead of "import" to make it runtime dependendant, so nodejs will not require it when you run code on server.

One more thing we need to do is to define process.env.BROWSER in our webpack config. It can be done in the following way:

```javascript
var webpack = require('webpack');

module.exports = {
    entry: "./client/app.js",
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                BROWSER: JSON.stringify(true)
            }
        }),
        new ExtractTextPlugin("[name].css")
    ],
    // ...
};
```

You can find whole [production config on github](https://github.com/WebbyLab/itsquiz-wall/blob/master/webpack.config.js).

Alternative solution is to create a plugin for babel that will just return "{}" on the server. I am not sure that it possible to do. If you can create babel-stub-plugin - it will be awesome.

#### Pain #3: Material UI uses vendor prefixing based on browser DOM

Ok. Let's go further. We managed our styles. And it seems that the problems with styles are solved. We use [Material UI](http://material-ui.com/) components library for our UI and we like it. But the problem with it is that it uses the same approach to vendor autoprefixing as Radium.

So we had to switch to the Material Design Lite. We use [react-mdl](https://www.npmjs.com/package/react-mdl) wrapper for React.

Great, it seems that we definitely solved all of the problems related to styling... sorry, not this time.

#### Pain #3: Assets loading order

Webpack will generate a javascript bundle for you and will pack all css files to the same bundle. It is not a problem in SPA - you just load the bundle and start your app. With isomorphic SPA everything is not so obvious.

Firstly, it is a good idea to move your bundle.js to the end of markup. In this case, user will not wait untill large (it can be several megabytes) bundle.js is loaded. A browser will render HTML immediately.

```html
<html>
    <head>
        <title>Quiz Wall</title>
    </head>
    <body>
        <div id="react-view">${componentHTML}</div>

        <script type="application/javascript" src="/build/bundle.js"></script>
    </body>
</html>
```

This works. But moving the bundle.js to the end also moves styles to the end (as they are packed into the same bundle). So, a browser will render markup without CSS and after that it will load bundle.js (with CSS in it) and only after that it will apply styles. In this case, you will get blinking UI.

Therefore, the right way is to split your bundle into two parts and load everything in the following order:
1. Load CSS
2. Load components HTML markup
3. Load JS

```html
<html>
    <head>
        <title>Quiz Wall</title>
        <link rel="stylesheet" href="/build/bundle.css">
    </head>
    <body>
        <div id="react-view">${componentHTML}</div>

        <script type="application/javascript" src="/build/bundle.js"></script>
    </body>
</html>
```

And the cool thing about webpack is that it has a lot of plugins and loaders. We use [extract-text-webpack-plugin](https://www.npmjs.com/package/extract-text-webpack-plugin) to extract css to a separate bundle.

Your config will look similar to this one.
```javascript
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./client/app.js",
    plugins: [
        new ExtractTextPlugin("[name].css")
    ],
    output: {
        path: __dirname + '/public/build/',
        filename: "bundle.js",
        publicPath: "build/"
    },
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!less-loader")
            }
        ]
    }
};

```
You can find whole [production webpack config on github](https://github.com/WebbyLab/itsquiz-wall/blob/master/webpack.config.js).

### Isomorphic routing

#### Joy #2 - React Router

React router starting from version 1.0.0 works greatly in isomorphic environment. But there are a lot of outdated tutorials written when react-router-1.0.0 was still in beta. Don't worry, official documentation has [working example of server-side routing](https://github.com/rackt/react-router/blob/master/docs/guides/advanced/ServerRendering.md).


### Isomorphic data fetching

#### Joy #3 - Redux

[Redux](https://github.com/rackt/redux) is another library that works greatly in isomorphic environment. The main issues with isomorphic apps:
1. Server processes several requests simultaneously. So, you should have isolated state for each request. No singleton flux stores in this case.
2. You should create new stores for each request.
3. You should dump all stores states at the end of request processing and pass this states to the browser. So, a browser will be able to fill existing flux stores with received state and rerender React tree.

With redux it can be done easily:
1. Just one store
2. react-redux uses react context to pass request related store way down by react components tree
3. redux store has convenient API for dumping and restoring store state.

[Here you can find working code](https://github.com/WebbyLab/itsquiz-wall/blob/master/server/app.js)

### Data fetching

You should write code that works both on the server and on the client. Usually in SPAs (even not isomorphic) we write API layer which can be used on the server too. This layer is responsible for all communications with the REST API. It can be packed as separate library for using it in third-party projects.

Here is an example that works both on server and on client:

```javascript
'use strict';

import apiFactory from './api';

const api = apiFactory({
    apiPrefix: 'http://itsquiz.com/api/v1'
});

// Can be use in a following manner
const promise = api.users.list();
```

For making http request you can use something like [axios](https://www.npmjs.com/package/axios) but I prefer [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) which uses [whatwg-fetch]() (from Github) in browser or [node-fetch](https://www.npmjs.com/package/node-fetch) on server.
"fetch" is a [standard](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) that is already [supported by firefox and chrome](http://caniuse.com/#search=fetch) natively.

It is the easy part. More complex part is not to create api library but to use it in isomorphic environment.

**How client usually works**
1. React component rendering.
2. Show loading spinner
3. Fetch all the component (pgge) dependent data
4. Update the page (rerender React component with fetched data)

So, the idea is simple. A user will wait for data but will not wait for UI response. So, you should render immediately without data and show spinner and show the data when it was fetched.

**How server usually works**
1. Preload all required data for the page
2. Render the page (with data) to string
3. Send HTML markup to client

We want to write the same code for two scenarios. How do we handle this?
The idea is simple. We use action creators and they trigger data fetching. So, we should describe all page dependencies - action creators that will be used for data fetching.

The isomorphic part of code will look like:

```javascript
'use strict';

import React               from 'react';
import { connect }         from 'react-redux';
import { loadActivations } from 'actions/activations';
import connectDataFetchers from 'lib/connectDataFetchers.jsx';

import ActivationsPage from 'components/pages/ActivationsPage.jsx';

class ActivationsPageContainer extends React.Component {
    render() {
        return (
            <ActivationsPage
                activations = {this.props.activations}
                search      = {this.props.search}
                onItemClick = {this.handleQuizCardClick}
                onSearch    = {this.handleSearch}
            />
        );
    }
}

export default connect({activations : state.activations})(
    connectDataFetchers(ActivationsPageContainer, [ loadActivations ])
);
```

So, you should wrap your component in another one which will be responsible for data fetching. We use "connectDataFetchers" function for it. It takes React component class and array of references to action creators.

**How it works?**

In browser the wrapper component will call action creators in **componentDidMount** lifecycle hook.  So, it is a common pattern for SPA.

*IMPORTANT: componentWillMount is not suitable for this because it will be invoked on the client and server. componentDidMount will be invoked only on the client.*

On the server we do this in a different way. We have a function ["fetchComponentsData"](https://github.com/WebbyLab/itsquiz-wall/blob/master/server/utils.js#L4) which takes an array of components you are going to render and calls static method "fetchData" on each. One important thing is a usage of promises. We use promises to postpone rendering until the required data is fetched and saved to the redux store.

"connectDataFetchers" is extremely simple:

```javascript
import React   from 'react';
import Promise from 'bluebird';

export default function connectDataFetchers(Component, actionCreators) {
    return class DataFetchersWrapper extends React.Component {
        static fetchData(dispatch, params = {}, query = {}) {
            return Promise.all(
                actionCreators.map( actionCreator =>
                    dispatch( actionCreator(params, query) )
                )
            );
        }

        componentDidMount() {
            DataFetchersWrapper.fetchData(
                this.props.dispatch,
                this.props.params,
                this.props.location.query
            );
        }

        render() {
            return (
                <Component {...this.props} />
            );
        }
    };
}

```

So, on server our code looks like:

```javascript

// On every request
const store = configureStore();

match({ routes, location: req.url }, (error, redirectLocation, {components, params, location}) => {
    fetchComponentsData(store.dispatch, components, params, location.query).then(() => {
        const componentHTML = ReactDOM.renderToString(
            <Provider store={store}>
                <RoutingContext {...renderProps}/>
            </Provider>
        );

        return renderHTML({
            componentHTML,
            initialState: store.getState()
        });
    });
});
```

Here is the whole server app - https://github.com/WebbyLab/itsquiz-wall/blob/master/server/app.js

### Isomorphic configuration

The simplest way it to use "config.json" and require it wherever needed. And you can find that a lot of people are doing so. In my opinion, this is a bad solution for isomorphic SPA.

What wrong with it?

The problem is that when you require "config.json" webpack will pack it into your bundle.

1. You cannot change config without rebuilding the app. It is not an option for me because I want to use the same build on staging and later on production the only difference is configuration options.
2. You can have inconsistent config state. Backend sees the new one, but frontend does not see changes because the config is packed into the bundle.

The solution is to leave config outside the bundle and place it in some sort of global variable that can be set in index.html.

We load out config on the server and return it in index.html

```html
<div id="react-view">${componentHTML}</div>

<script type="application/javascript">
    window.__CONFIG__ = ${JSON.stringify(config)};
    window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
</script>

<script type="application/javascript" src="${config.staticUrl}/static/build/main.js"></script>
```


But depending on a global variable in your code is not a good idea. So, we create "config.js" module that just exports global variable. And our code depends on "config.js" module.  Our "config.js" should be isomorphic, so on the server we just require json file.

```javascript
// config.js

if (process.env.BROWSER) {
    module.exports = window.__CONFIG__;
} else {
    module.exports = require('../etc/client-config.json');
}
```

and we use the "config.js" in the following manner in our isomorphic code:

```javascript
'use strict';

import config     from './config';
import apiFactory from './api';

export default apiFactory({
    apiPrefix: config.apiPrefix
});
```

### Isomorphic localization

Very few tutorials explain how to deal with localization in a regular SPA. No tutorials at all say how to deal with localization in an isomorphic environment. In general, it is not an issue for most of the developers because there is no need to support other languages except English. But it is really important topic, so I've decided to describe localization issues in the separate post. It will be end to end React applications localization guide (including isomorphic issues).

## Statistics
Universal (isomorphic) code - 2396 SLOC (93.3%)
Client specific code - 33 SLOC (1.2%)
Server specific code - 139 SLOC (5.4%)

While all codebase growths, isomorphic part of the code growths the most. So, code reuse rate will become higher with time.


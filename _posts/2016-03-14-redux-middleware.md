---
layout: post
title:  "Building Redux Middleware"
date:   2016-03-14 12:00:09 +1300
excerpt_separator: <!--more-->
author: Zach Silveira
published: true
categories: react, webpack
---

After writing my post a few months ago on [building your own redux app](https://reactjsnews.com/your-first-redux-app), I have been asked a couple times to write a guide on creating redux middleware and how it works. This will be a quick post on how you can acheive anything with your own middleware!

<!--more-->

##Basic middleware

```js

const customMiddleware = store => next => action => {
  if(action.type !== 'custom') return next(action)
  //do stuff!
}
```

Applying it:

```js
import { createStore, applyMiddleware, } from 'redux'
import reducer from './reducer'
import customMiddleware from './customMiddleware'

const store = createStore(
  reducer,
  applyMiddleware(customMiddleware)
)
```

Whaaa? `store => next => action =>` I know that looks confusing. Essentially you are building a chain of functions, it will look like this when it gets called:

```js
//next looks something like this:
let dispatched = null
let next = actionAttempt => dispatched = actionAttempt 

const dispatch = customMiddleware(store)(next)

dispatch({
  type: 'custom',
  value: 'test'
})
```

All you are doing is chaining function calls and passing in the neccesary data. When I first saw this I was confused a little due to the long chain, but it made perfect sense after reading the article on [writing redux tests](http://redux.js.org/docs/recipes/WritingTests.html). 

So now that we understand how those chained functions work, let's explain the first line of our middleware.

```js
if(action.type !== 'custom') return next(action)
```

There should be some way to tell what actions should go through your middleware. In this example, we are saying if the action's type is not `custom` call next, which will pass it to any other middleware and then to the reducer.

##Doing Cool stuff

The official guide on [redux middleware](http://redux.js.org/docs/advanced/Middleware.html) covers a few examples on this, I'm going to try to explain it in a more simple way.

Say we want an action like this:

```js
dispatch({
  type: 'ajax',
  url: 'http://api.com',
  method: 'POST',
  body: state => ({
    title: state.title
    description: state.description
  }),
  cb: response => console.log('finished!', response)
})

```

We want this to do a post request, and then call the `cb` function. It would look something like this:

```js
import fetch from 'isomorphic-fetch'

const ajaxMiddleware = store => next => action => {
  if(action.type !== 'ajax') return next(action)
  
  fetch(action.url, {
    method: action.method,
    body: JSON.stringify(action.body(store.getState()))
  })
  .then(response => response.json())
  .then(json => action.cb(json))
}
```

It's pretty simple really. You have access to every method redux offers in middleware. What if we wanted the `cb` function to have access to dispatching more actions? We could change that last line of the fetch function to this: 

```js
.then(json => action.cb(json, store.dispatch))
```

Now in the callback, we can do:

```js
  cb: (response, dispatch) => dispatch(newAction(response))

```

As you can see, middleware is very easy to write in redux. You can pass store state back to actions, and so much more. If you need any help or if I didn't go into detail enough, feel free to leave a comment below!

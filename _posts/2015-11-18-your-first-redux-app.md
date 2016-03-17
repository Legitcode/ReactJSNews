---
layout: post
title:  "Your First Immutable React & Redux App"
excerpt_separator: <!--more-->
author: Zach Silveira
date: 2015-11-18 19:35
published: true
categories: react, redux
---

I've been back from [Nodevember](http://nodevember.org) for two days now. I took a coworker with me who hasn't used javascript in years. After the conference he's been asking me non-stop on how to get started with React. This is aimed at people who understand javascript but have never used node. Even if you've used React quite a bit, this will help you understand [Redux](http://redux.js.org/) and give you a taste of ImmutableJS

<!--more-->
I've been back from [Nodevember](http://nodevember.org) for two days now. I took a coworker with me who hasn't used javascript in years. After the conference he's been asking me non-stop on how to get started with React. This is aimed at people who understand javascript but have never used node. Even if you've used React quite a bit, this will help you understand [Redux](http://redux.js.org/) and give you a taste of ImmutableJS

###What this covers

I'm the kind of person who doesn't always understand *big words*. The redux docs to me, use a lot of these. I'd like to make everything seem as simple as possible so that you can wrap your head around it. After all, how hard can it be to understand [2kb's of code ;)](http://redux.js.org/). We will go through the process of setting up our app, from installing node, to creating our package.json and understanding how that works. If you understand that, and I'm sure a vast majority of your do, skip ahead to where we [start building the app](#more-setup). Make sure you [add every npm module we'll be using](https://github.com/Legitcode/redux-tutorial/blob/master/package.json) first.

**P.S.**
All of the code below is [on github](https://github.com/Legitcode/redux-tutorial)
Clone it, `npm install`, and `npm start` to see the finished version of this tutorial.


##Setup

The first thing we need to do is make sure we have `node` installed. The best way to do this is by using [nvm](https://github.com/creationix/nvm). Paste this into your terminal, and you'll have nvm installed:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
```

After that, we need to add it to our `bash_profile`:

```
vi ~/.bash_profile

##inside paste this

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
```

Now that it's installed, restart your terminal and do `nvm install 5.0` (or whatever the [latest version of node is](http://nodejs.org)). Finally, running `nvm alias default node` will make sure node is always accessible after opening new terminal windows.

###Create our project

Now that we have node installed, it's time to create our project folder. I'll do `mkdir todo` and then `cd` into it. You can name it anything you'd like.
The way npm packages work is very simple. Every module has a `package.json`. This file includes any dependencies you may need inside of your React app. To get started, run `npm init` inside of your project folder. Go through the steps, you should end up with something like this:

```js
{
  "name": "redux-tutorial",
  "version": "0.0.1",
  "description": "a todo app that you'd never want to use",
  "main": "index.js",
  "scripts": {
    "test": " "
  },
  "keywords": [
    "todo"
  ],
  "author": "Zach Silveira",
  "license": "ISC"
}
```

You may be a little confused as to why we need this for every package, but I'll explain that later. If you plan to upload this project to github, create a file called `.gitignore` and put `node_modules` inside, and save it. This way you do not commit dependencies.

###Install our dependencies

For this project we need a few packages. If you follow this tutorial and add on to it, you'll probably end up with *a lot* of packages! Let's install React, and save it too!

```
npm install react --save
```

Doing `--save` adds React to our package.json as a dependency. This way, other people can run our app by running `npm install` and (hopefully) `npm start`!

Go ahead and install `redux`, `react-redux`, and `webpack-dev-server`. Save those as well. Webpack will bundle our code, and the dev server will let us actually interact with our app.

**Edit** After building out the rest of this tutorial, I realized there are a lot more dependencies than I expected. You can see all of the ones you'll need on the [example repo](https://github.com/Legitcode/redux-tutorial/blob/master/package.json#L15). Add them to your `package.json` and run `npm install` to get them all.

###More Setup

Let's get the boring stuff out of the way so that when we start coding, we can actually interact with it! Create an `index.html` file and paste this into the contents

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo</title>
</head>
<body>
  <div id="react"></div>
  <script src="bundle.js"></script>
</body>
</html>
```

Create a file called `webpack.config.js` as well, and put in

```js
var path = require("path");
module.exports = {
  entry: './components/app.jsx',
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}
```

You can look at the [webpack docs](https://webpack.github.io/docs/) to get a complete understanding of everything in our config. The basic idea is that our entry point is the root js file for our app. You can have many of these for other pages. The output specifies where the built version will go, after it is ran through any loaders. The babel loader we included will transform any cool new [ES2015 features](https://babeljs.io/docs/learn-es2015/) we will use into ES5. This way the code will run in older browsers! The last part to understand is the `resolve` section. It tells webpack what file extensions to look for when importing things into our js files.


We're almost done with the setup, I promise! The final step is to add a start script to our `package.json`, this way we can type `npm start` and our server will start. Under the `scripts` section in your package.json, add `"start": "webpack-dev-server"`.

We are all set to actually build this app! You shouldn't have any issues with the setup because I've been running every command on a brand new Macbook as I'm writing this tutorial. However, feel free to leave a comment with any issues you've ran into!

###Let's make this app!

Now that we've got all that out of the way, let's start by writing two actions that our todo app will need. When you decide to use Redux, you should never think of writing `this.setState` inside of a component again. All of your application state should be encapsulated inside of redux from here on out. Create a folder in your project called `actions`.

For the purpose of this tutorial we will make these inside of the same file. You can split them up into multiple files, follow the [duck philosophy](https://github.com/erikras/ducks-modular-redux), or do something else. This is part of the reason redux is so nice, you can do this however you want. I think after going through this whole tutorial you will truly understand this.

**Our first actions**

create `index.js` inside of your `actions` folder.

```js
export function addTodo(todo){
  return {
    type: 'addTodo',
    todo
  }
}

export function deleteTodo(index){
  return {
    type: 'deleteTodo',
    index
  }
}

```

Actions simply describe something you want to change inside of your app. For this app, our `types` will be simple strings. You should take a look at [action constants](http://redux.js.org/docs/basics/Actions.html) before seriously writing an app.

These actions will be called by our component when someone hits the Add or delete button. Instead of a function in our component that would change the internal state, we will be updating our redux store. Now let's create a reducer that will store our todo's and handle these actions. After that, I'll explain how this works in case you're confused!

Create a new folder called `reducers` and inside of a file called `todos.js` put the following.

```js
import Immutable from 'immutable'

export default (state = Immutable.List(['Code More!']), action) => {
  switch(action.type) {
    case 'addTodo':
      return state.push(action.todo)
    default:
      return state
  }
}
```
Oh yeah, I lied. There's another package you need to install, `immutable`. You can read about it [here](https://facebook.github.io/immutable-js/). The basic idea is that mutable state is bad. Instead of changing things inline, it returns a new copy every time you change something that is immutable. The cool part is that the api is very similar to regular javascript variable types. As you can see, you can push to a list just like you would on an array.

###Hold up

We've done a lot so far. Setup the project from nothing, installed some things, written our actions, and started our reducer. You might be a little confused as to how this is actually going to work. We're getting there, but the basic idea is this: Your component wants to fire off an event, like adding a todo. You dispatch an action (like the ones we created). Next, the corresponding reducer will be called. If the action is `addTodo` in our case, the todo will be pushed to the current state and a new copy will be returned. The store is then updated. After writing our components we will go over hooking our store into our app.

###Reducer -> store

Now that we have our reducer setup, let's  create our store. In the root of our project folder, create `store.js`

```js
import { createStore } from 'redux';
import todos from './reducers/todos'
export default createStore(todos)
```

`createStore` brings together actions and reducers, among other things. You can get the low-down on that [here](http://redux.js.org/docs/basics/Store.html). You may also be wondering how you would go about having multiple stores, since your app needs many of them for different things, right? Wrong. In redux, you always have one store, with many *reducers*. We won't go into that in this tutorial, but after you finish, you can [go learn about that](http://redux.js.org/docs/basics/Reducers.html#splitting-reducers).


###Where's React?

I decided to get the redux stuff out of the way, because I think it's the hardest part for a beginner. I also know that more people are likely to have used React before. If that describes you, we only have easy things left.

Create `components/todos.jsx` in your project folder.

```js
import React from 'react'
import { connect } from 'react-redux'

const Todos = ({todos}) => (
  <div>
    <h1>Todos</h1>
    {todos.map(todo => <p key={todo}>{todo}</p>)}
  </div>
)

function mapStateToProps(todos) {
  return {
    todos
  }
}

export default connect(mapStateToProps)(Todos)

```

This is a small amount of code, but there's a couple key points to understand. `connect` allows us to choose what parts of our state we want to give to our React component. In this instance, it may seem a bit verbose, but it is necessary in a real app with multiple reducers. [This page](http://redux.js.org/docs/basics/UsageWithReact.html) will help you understand more advanced use cases.

Create `components/app.jsx`

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from '../store'
import Todos from './todos'

let reactElement = document.getElementById('react')
render(
  <Provider store={store}>
    <Todos />
  </Provider>,
  reactElement
)
```

This is how you render your top-level app using redux. It will inject your redux state as props and pass in any changes automatically. This is why we can use stateless components! Don't forget to `npm install react-dom` before the next step!

###First look

If you run `npm start` in your root directory and navigate to `http://localhost:8080` you should see **Todos** along with one item! It might not look like much, but we've done a lot. Our component is receiving its props from our store. Don't remember? Look at `reducers/todos.jsx`. We set an initial state of `Code More!`, so that's where it's coming from. If you've never used React before, this is simple to understand. If you've used it before, then you really appreciate how simple the syntax is. Redux completely strips state from your components so you don't have to worry about it anymore.

###Let's add a todo

We're one small step from adding todos to this thing. Let's make another stateless component that will handle adding todos.

`components/NewTodo.jsx`

```js
import React from 'react'

const NewTodo = ({onChange}) => (
  <div>
    <h3>New</h3>
    <input type="text" onKeyUp={onChange}/>
  </div>
)

export default NewTodo
```

Pretty self explanatory. When the value changes, we will call a function that we will pass into it. Go back to `components/todos.jsx`. Then inside of the component, add it in. It should look like this:

```js
import React from 'react'
import { connect } from 'react-redux'

import NewTodo from './NewTodo'
import { addTodo } from '../actions'

const Todos = ({todos, dispatch}) => (
  <div>
    <h1>Todos</h1>
    <NewTodo onChange={e => {
      if(e.keyCode == 13){
        dispatch(addTodo(e.target.value))
        e.target.value = ''
      }
    }}/>
    {todos.map(todo => <p key={todo}>{todo}</p>)}
  </div>
)

function mapStateToProps(todos) {
  return {
    todos
  }
}

export default connect(mapStateToProps)(Todos)
```

We did three things here.

1. Imported `NewTodo`
2. Imported our action
3. Added in our component

There's one thing that confused me when I first got to this point in learning how to use redux. I didn't realize that actions are merely pure functions. For example, these are the same thing:

```js
dispatch(addTodo('test'))
//same
dispatch({
  type: 'addTodo',
  todo: 'test'
})
```

Actions help you dispatch faster (less code to type, plus help with structure) and should always be *pure functions*. This is another word that you may not know. Pure functions are function that always give the same result if the input is the same. This means you should never do an ajax request before returning an action. The output could be different depending on a success or fail.

Now if you reload the page, you'll see that when you hit enter (that's keyCode 13) a new todo is added to the list! It gets added to the bottom though. You can fix that by changing `push` to `unshift` in your reducer.

###How does this work?

This is about the end of our tutorial. I've set you up to build out the rest of this app. You know how to dispatch actions and see the state change. I'll recap one more time as to how this is working. When you dispatch a new todo, it is sent to the reducer, which adds it to our [Immutable List](https://facebook.github.io/immutable-js/docs/#/List). If you remember what I said earlier, Lists in Immutable have the same syntax as a plain array. This is why we can map it just like we would with a normal array! Sorry for that little tangent... After going through the reducer, the state tree is then updated and the Provide component will pass in the new state from redux as props!

##Conclusion

I hope that you followed along and really understood everything we did. If you got stuck, take a look at the [code on github](https://github.com/Legitcode/redux-tutorial). If that doesn't help, you can leave a comment below. Lastly, if there's something I could have explained better, [send a pull request](https://github.com/Legitcode/ReactJSNews). This whole post is on github after all.

If you finished everything in the tutorial, implement the `deleteTodo` action, and then whatever you'd like!

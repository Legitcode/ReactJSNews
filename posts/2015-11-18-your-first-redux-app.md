---
layout: post
title:  "Your First Immutable React & Redux App"
excerpt_separator: <!--more-->
author: Zach Silveira
date: 2015-11-17 21:35
published: false
categories: react, redux
---

I've been back from [Nodevember](http://nodevember.org) for two days now. I took a coworker with me who hasn't used javascript in years, and after the conference he's been asking me non-stop on how to get started with React. This is aimed at people who understand javascript, maybe even used React quite a bit, but you have no experience with [Redux](http://redux.js.org/).

<!--more-->
I've been back from [Nodevember](http://nodevember.org) for two days now. I took a coworker with me who hasn't used javascript in years, and after the conference he's been asking me non-stop on how to get started with React. This is aimed at people who understand javascript but have never used node. Even if you've used React quite a bit, this will help you understand [Redux](http://redux.js.org/).

###What this covers

I'm the kind of person who doesn't always understand *big words*. The redux docs to me, use a lot of these. I'd like to make everything seems as simple as possible so that you can wrap your head around it. After all, how hard can it be to understand [2kb's of code ;)](http://redux.js.org/). We will go through the process of setting up our app, from installing node, to creating our package.json and understanding how that works. If you understand that, and I'm sure a vast majority of your do, skip ahead to where we [start building the app](#app).


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
The way npm packages work is very simple. Every module has a `package.json` file. This file includes any dependencies you may need inside of your React app. To get started, run `npm init` inside of your project folder. Go through the steps, you should end up with something like this:

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

For this project we need a few packages. If you follow this tutorial and add on to it, you'll probably end up with a lot more packages! Let's install React, but save it too!
```
npm install react --save
```
Doing `--save` adds React to our package.json as a dependency. This way, other people can run your app by running `npm install` and (hopefully) `npm start`!

Go ahead and install `redux`, `react-redux`, and `webpack-dev-server`. Save those as well. Webpack will bundle our code, and the dev server will let us actually interact with our app. We need to install webpack globally by doing `npm install webpack -g`.

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
  entry: {
    app: ["./app/main.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "bundle.js"
  }
};
```

We're almost done with the setup, I promise! The final step is to add a start script to our `package.json`, this way we can type `npm start` and our server will start. Under the `scripts` section in your package.json, add `"start": "webpack-dev-server"`.

We are all set to actually build this app! You shouldn't have any issues with the setup because I've been running every command on a brand new Macbook as I'm writing this tutorial. However, feel free to leave a comment with any issues you've ran into!

###Let's make this app!

Now that we've got all that out of the way, let's start by writing two actions that our todo app will need. When you decide to use Redux, you should never think of writing `this.setState` inside of a component again. All of your application state should be encapsulated inside of redux from here on out. Create a folder in your project called `actions`.

For the purpose of this tutorial we will make these inside of the same file. You can split them up into multiple files, follow the [duck philosophy](https://github.com/erikras/ducks-modular-redux), or do something else you like. This is part of the reason redux is so nice, you can do this however you want. I think after going through this whole tutorial you will truly understand this.

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
    type: 'addTodo',
    index
  }
}

```

Actions simply describe something you want to change inside of your app. For this app, our `types` will be simple strings. You should take a look at [action constants](http://redux.js.org/docs/basics/Actions.html) before seriously writing an app.

These actions will be called by our component when someone hits the Add or delete button. Instead of a function in our component that would change the internal state, we will be updating our redux store. Now let's create a reducer that will store our todo's and handle these actions. After that, I'll explain how this works in case you're confused!

Create a new folder called `reducers` and inside of a file called `todos.js` put the following.

```js
import Immutable from 'immutable'

export default (state = Immutable.List(), action){
  switch(action.type) {
    case: 'addTodo'
      return state.push(action.todo)
  }
}

```
Oh yeah, I lied. There's another package you need to install, `immutable`. You can read about it [here](https://facebook.github.io/immutable-js/). The basic idea is that mutable state is bad. Instead of changing things inline, it returns a new copy every time you change something that is immutable. The cool part is that the api is very similar to regular javascript variable types. As you can see, you can push to a list just like you would on an array.

###Hold up

We've done a lot so far. Setup the project from nothing, installed some things, and written our actions and the start of our reducer. You might be a little confused as to how this is actually going to work. We're getting there, but the basic idea is this. Your component wants to fire off an event, like adding a todo. You dispatch an action (like the ones we created). Next, the corresponding reducer will be called. If the action is `addTodo` in our case, the todo will be pushed to the current state and a new copy will be returned. The store is then updated. After writing our components we will go over hooking our store into our app.

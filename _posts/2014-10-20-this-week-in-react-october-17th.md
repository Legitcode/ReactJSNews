---
layout: post
title:  "This Week in React: Oct 20"
excerpt: "This is the first weekly roundup on ReactJS News! We've been busy working on making this site awesome for you guys, and it's coming along. Let's get started."
author: Zach Silveira
date: 2014-10-20 18:22
published: true
categories: react
tags: twir
---
This is the first weekly roundup on ReactJS News! We've been busy working on making this site awesome for you guys, and it's coming along. Let's get started.

##React DnD
First off, we've got a [React Drag n' drop library](https://github.com/gaearon/react-dnd). I've had to make something like this at work, but this would have been so much easier to use. Creating a drop target with this mixin is very easy, as we can see from its documentation:

```js
var { DragDropMixin } = require('react-dnd'),
    ItemTypes = require('./ItemTypes');

var ImageBlock = React.createClass({
  mixins: [DragDropMixin],

  configureDragDrop(registerType) {

    registerType(ItemTypes.IMAGE, {

      // dropTarget, when specified, is { acceptDrop(item)?, canDrop(item)? enter(item)?, over(item)?, leave(item)? }
      dropTarget: {
        acceptDrop(image) {
          // Do something with image! for example,
          DocumentActionCreators.setImage(this.props.blockId, image);
        }
      }
    });
  },

  render() {

    // {...this.dropTargetFor(ItemTypes.IMAGE)} will expand into
    // { onDragEnter: (handled by mixin), onDragOver: (handled by mixin), onDragLeave: (handled by mixin), onDrop: (handled by mixin) }.

    return (
      <div {...this.dropTargetFor(ItemTypes.IMAGE)}>
        {this.props.image &&
          <img src={this.props.image.url} />
        }
      </div>
    );
  }
);
```

Want to play around with it? Check out [this JSFiddle](http://jsbin.com/sutopepobu/1/edit?html,js,output)!
##Morearty.js
[Morearty.js](https://github.com/moreartyjs/moreartyjs) aims to help those who need more advanced state handling in React. What's cool is that component state is transferred to sub-components in a binding attribute and can be retrieved using a custom method. This can be really useful when you have two components interacting together. Creating states (contexts) in morearty is pretty simple: 

```js
var Ctx = Morearty.createContext(
  { // initial state
    nowShowing: 'all',
    items: [{
      title: 'My first task',
      completed: false,
      editing: false
    }]
  },
  { // configuration
    requestAnimationFrameEnabled: true
  }
);
```

Take a look at [the docs](https://github.com/moreartyjs/moreartyjs) for more information.

That's all that was sent in this week. I've been super busy trying to get our news section up and running. It's been hard since I just took on a second job. Please send in anything you make to our Twitter [@ReactJSNews](http://twitter.com/reactjsnews). Before you leave, take a look at some of these React articles I found interesting this week:

-   [Swarm.js+React — real-time, offline-ready Holy Grail web apps](http://swarmjs.github.io/articles/todomvc/)
-   [React Art - drawing vectors in React](https://github.com/reactjs/react-art)
-   [Learning React.js: Getting Started and Concepts](http://scotch.io/tutorials/javascript/learning-react-getting-started-and-concepts)

**Interesting Stackoverflow Posts**

-   [Flux: return values from AJAX to the component](http://stackoverflow.com/questions/26451659/flux-return-values-from-ajax-to-the-component)
-   [What is the best way for interacting between Components in Reactjs?](http://stackoverflow.com/questions/26407273/what-is-the-best-way-for-interacting-between-components-in-reactjs)
-   [How to reset a React component?](http://stackoverflow.com/questions/26358144/how-to-reset-a-reactjs-element)
-   [In single page apps, is it standard to do sorting and filtering on the server?](http://stackoverflow.com/questions/26352300/in-single-page-apps-is-it-standard-to-do-sorting-and-filtering-on-the-server)

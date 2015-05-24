---
layout: post
title:  "Building Components with React.js and Reflux"
author: James Burnett
date: 2015-04-13 21:26
published: true
categories: react
---
React is a great view library. If used just right, it even makes an alright controller. However, sometimes you need something more. That is where Flux can be handy.

Flux is the Facebook solution to keep the MVC paradigm from becoming unmanageable. If you are wondering whether Flux is right for your project, Dan Abramov made ["The Case for Flux"](https://medium.com/@dan_abramov/the-case-for-flux-379b7d1982c6) a few weeks ago. I cannot recommend his article enough. To summarize, Dan points out that Flux is great if:

* "your data changes over time" and you "care about immediately reflecting those changes in the UI"
* "you want to cache data in memory, but it can change while cached"
* "your data is relational and models include and depend on each other"
* "data is assembled from different sources and can be rendered in several places throughout the UI"

If none of that sounds important, you probably do not need Flux. Let's assume it does sound important though. What next?


The Assignment
--------------

We are going to write a very simple edit tool. Our component will have two parts. First, a label telling users to "Enter Some Text." Second, a block where a user can enter some text. That is pretty simple.

However, we are going to complicate things by requiring that multiple components on the same page display that data in different ways. We are going to complicate things a little further by requiring that there is no global "parent" app. Instead, it is important that we can "sprinkle" the react components on to our page.

"Why?," you say. A lot of us are trying to augment legacy apps. While you can generally add sprinkles to a cake, it is often harder to convince your boss to let you re-bake the whole cake. Also, because coordinating such a large single root starts to become really complex as the app grows. And it becomes painful once we need to start making ajax calls or, or add a backbone layer, or, well, anything not display related.


Getting Started
---------------

The examples in this article are based on the [Dex](https://github.com/HurricaneJames/dex) code base. Dex is a Rails and Browserify webapp. However, the concepts in this article should be easily transferrable. We will be working on the BlueBird component, located in `app/assets/javascripts/components/BlueBird.jsx`. BlueBird is put in the global scope in `components.js` and loaded onto the page by `react_component` from the [react-rails](https://github.com/reactjs/react-rails) package.

If you want to follow along and write code as we go grab [Dex v3.0](https://github.com/HurricaneJames/dex/tree/v3.0).

    git clone https://github.com/HurricaneJames/dex/tree/v3.0
    cd dex
    bundle install
    npm install
    rails s

If you just want to jump to the end, grab [Dex v3.1](https://github.com/HurricaneJames/dex/tree/v3.1). All of the code from this article will be available there.

    git clone https://github.com/HurricaneJames/dex/tree/v3.1
    cd dex
    bundle install
    npm install
    # separate console
    rails s
    # optional, and from a different console
    npm run fayeserver
    # open a browser and point it to http://localhost:3000/pages/index


BlueBird
--------

This is a super simple React.js component. We will create a two files in the `components` directory, `BlueBird.jsx` and `BlueBirdContainer.jsx.` The container handles any state, the actual component is stateless. This is the container design pattern. and is very useful when creating React components. Since we are using React-Rails, we will also require the container file as a global variable in the  `components.js` file.

Starting with the `BlueBird` component:

    // app/assets/javascripts/components/BlueBird.jsx
    var React = require('react');

    var BlueBird = React.createClass({
      displayName: 'BlueBird',
      propTypes: {
        content: React.PropTypes.string,
        onChange: React.PropTypes.func
      },
      onChange: function(e) {
        this.props.onChange(e.target.value);
      },
      render: function() {
        return (
          <div>
            <span>Enter Some Text</span>
            <textarea
              value={this.props.content}
              onChange={this.onChange}
              rows={15}
            />
          </div>
        );
      }
    });

    module.exports = BlueBirdBody;

As you can see, this really is a very simple React component. The render function has a span telling users to `Enter Some Text` and a textarea to actual enter that text. Next, we create our container, a separate component where we will keep state.

    var React = require('react')
      , BlueBird = require('./BlueBird');

    var BlueBirdContainer = React.createClass({
      displayName: 'BlueBirdContainer',
      propTypes: {
        reverse: React.PropTypes.bool
      },
      getInitialState: function() {
        return {
          bluebirdBody: ''
        }
      }
      getContent: function() {
        if(this.props.reverse) {
          return this.state.bluebirdBody.split('').reverse().join('');
        }else {
          return this.state.bluebirdBody;
        }
      },
      onBodyChange: function(newValue) {
        this.setState({bluebirdBody: newValue});
      },
      render: function() {
        return (
          <div>
            <BlueBird content={this.getContent()} onChange={this.onBodyChange} />
          </div>
        );
      }
    });

    module.exports = BlueBirdContainer;

This component is fairly straightforward. It holds an internal state for the text, and if the `reverse` prop is set to `true`, then it will reverse the text in the text box. This is not particularly useful, except as something interesting we can demo.

Finally, we will add the component to our app:

- add the component to our components.js file
    
        BlueBirdContainer = require('./components/BlueBirdContainer');

- add the component to our page
    
        <%# app/views/pages/index.html.erb %>
        <h1>BlueBird - Index</h1>
        <%= react_component 'BlueBirdContainer' %>

- start our server

        rails s

- and load the page in a browser `http://localhost:3000/pages/index`).

This gives us a nice simple text box.

![Basic BlueBird Container](/content/images/2015/04/BuildingInteractive-001.png)


Multiple BlueBirds
------------------

Now that we have a basic component, we want to be able to add it to our page multiple times. Since we are using Rails, we can create a new view `pages/bluebird.html.erb`.

    <h1>BlueBird</h1>
    <%= react_component "BlueBirdContainer", {} %>
    <%= react_component "BlueBirdContainer", { reverse: true } %>

We add two components, the second one set to reverse. Then we add it to our `routes.rb`.

      get 'pages/bluebird'

Next we setup our `pages_controller.rb`.

      def bluebird
      end

Then, when we point our browser to `http://localhost:3000/pages/bluebird`...

![Double Blue Birds](/content/images/2015/04/BuildingInteractive-002.png)

We get two text boxes that are completely unrelated to each other. Not surprising since we never linked the state of the two container components. So, how do we link the two components together. Well, we have a couple options.

First, we could create a BlueBirdRootApp component. All state for the entire app would be contained in this single component, and it would pass that state down to its children along with callback props. This works great in simple cases, and even in cases where we are designing the entire app from scratch. However, it is a bit limiting when we need to sprinkle our React components into an existing app.

Second, we use Flux! When thinking back to Abramov's four cases, our requirement fits perfectly.


Flux / Reflux
-------------

So, what is flux?

    ╔═════════╗     ╔════════════╗     ╔════════╗     ╔═════════════════╗
    ║ Actions ║────>║ Dispatcher ║────>║ Stores ║────>║ View Components ║
    ╚═════════╝     ╚════════════╝     ╚════════╝     ╚═════════════════╝
         ^                                                    │
         └────────────────────────────────────────────────────┘


Flux is a version of the Model View Controller paradigm that focuses on unidirectional dataflow. It specifies a dispatcher, some stores, some views, and some actions. Actions trigger the dispatcher. The dispatcher routes actions to interested stores. The stores update based on the action, and then notify the views to rerender. Then, the cycle starts all over again.

There is a lot more detail, but this is where I'm going to stop. Why, because we are going to use Reflux, which is even easier.

    ╔═════════╗       ╔════════╗       ╔═════════════════╗
    ║ Actions ║──────>║ Stores ║──────>║ View Components ║
    ╚═════════╝       ╚════════╝       ╚═════════════════╝
         ^                                      │
         └──────────────────────────────────────┘

[Reflux](https://github.com/spoike/refluxjs) is an implementation of the basic concepts of Flux by Mikael Brassman. It greatly simplifies Flux by removing the dispatcher. Rather than actions flowing through a dispatcher, actions flow directly to the stores.

It is still possible to do everything with Reflux that can be done with Flux because stores can listen to other stores. However, in practice, I have yet to find that useful. Mostly, it just leads to overly complex code.


Adding Reflux to Our Project
----------------------------

The first thing we will need to do is add Reflux to our project. Since we are using browserify, we can add to the `package.json` dependencies.

    "reflux": "^0.2.7"

Alternatively, you can install it from the command line.

    npm install --save reflux

Then we need to create some actions, create a store to listen to those actions, and finally link that store to our `BlueBirdContainer` state. Fortunately, Reflux makes this easy.


Create Actions
--------------

Reflux provides many ways to create actions. It provides options for sync/async, promises, callbacks, etc... However, every time I have tried anything but the simplest, I have come to regret it. Flux, as an architecture, really wants us to stick to the `Actions -> Stores -> Components -> Actions` model. Chen Zihui wrote an interesting article, ["Hello, React.js,"](https://medium.com/@jetupper/hello-react-js-b87c63526e3a) about some common React.js/Flux mistakes. One of his stories speaks directly to complicating the Flux paradigm.

So, what is the simple way that you will probably use 99.99999% of the time. `Reflux.createActions([])`. That's it, a single function call with an array of action names. Let's look at it in the case of `BlueBirdActions.jsx`.

    // app/assets/javascripts/components/BlueBirdActions.js
    var Reflux = require('reflux');

    module.exports = Reflux.createActions([
      "inputChange"
    ]);

Project BlueBird is unrealistically simple, and it shows in our actions. We only have, or need, one: `inputChange`. To use this action we will add `BlueBirdActions` to our module and then call `BlueBirdActions.inputChange(newInput)`.


Creating a Store
----------------

Next we need to create a store. We will call this `BlueBirdStore.js`. Some people like to create separate folders for stores and actions, but we will keep them in the main `components` folder for now since we only have a few components.

As with actions, Reflux gives us a few options with stores that you probably will not use very much. At the lowest level, it is possible to link an arbitrary action with an arbitrary function via the `listenTo` function.

    var Store = Reflux.createStore({
      init: function() {
        this.listenTo(MyActionSet.myAction1, this.onMyAction1);
        this.listenTo(MyActionSet.myAction2, this.onMyAction2);
        this.listenTo(DifferentActions.myAction1, this.onMyConfusedAction);
      }
      onMyAction1: function() {},
      onMyAction2: function() {},
      onMyConfusedAction: function() {}
    });

However, there is an easier way that will simultaneously keep your code simpler too, `listenables`. `listenables` takes an array of Action classes and links the actions to their `onAction` functions. This can be a problem if you have actions with the same name, but in practice you should only have a single action class for each store (ex. `BlueBirdActions` with `BlueBirdStore`). As with most things code, keep your life simple and you will have fewer confusing bugs.

So for our BlueBird example, we would have:

    // app/assets/javascripts/components/BlueBirdStore.js
    var Reflux = require('reflux')
      , BlueBirdActions = require('./BlueBirdActions');

    var input = "";

    var Store = Reflux.createStore({
      listenables: [BlueBirdActions],
      init: function() { },
      getInitialState: function() { return input; },
      onInputChange: function(newValue) {
        input = newValue;
        this.trigger(input);
      }
    });

    module.exports = Store;

`listenables: [BlueBirdActions]` tries to link every `action` in `BlueBirdActions` to `onAction` if `onAction` is a function in the store. In this case that means `inputChange` is linked to `onInputChange`. `onInputChange` updates the internal model (`input = newValue;`) and calls `trigger` on the new data. Any components that are listening for store changes will receive an update with the new data.

You might also notice that we added a `getInitialState` function. to our store. Technically, you can add any functions you want. However, `getInitialState` is called by the `Reflux.connect` function when we start linking our store to our component state. It makes things easier by providing the component an initial state that matches the current state used by the other components.


Adding the new Store/Actions to BlueBird
----------------------------------------

Now that we have actions and a store, we need to link them into our BlueBirdContainer. It turns out that this is fairly simple.

First we need to require the new modules:

    var Reflux = require('reflux')
      , BlueBirdActions = require('./BlueBirdActions')
      , BlueBirdStore = require('./BlueBirdStore');

Next, we need to connect the store to the component's state. There are a couple ways to do this. The easiest is to use the `Reflux.connect` convenience mixin on our BlueBirdContainer component.

    mixins: [Reflux.connect(BlueBirdStore, 'bluebirdBody')],

It is important to note that mixins are discouraged in the React.js world these days. In fact, this is one of the very few mixins I still use. I use it because it makes the code very readable and keeps the logic simple. However, if you are dead set against mixins, or you want to use ES6 class syntax, you can fall back to calling the `listen` and `unsubscribe` functions in the `componentDidMount` and `componentWillUnmount` functions respectively.

    componentDidMount: function() {
      this.unsubscribe = BlueBirdStore.listen(this.onBlueBirdChange);
    },
    componentWillUnmount: function() {
      this.unsubscribe();
    },
    onBlueBirdChange: function(newBlueBird) {
      this.setState({ bluebirdBody: newState });
    }

Be warned, try to avoid being *"clever"* with these. Yes, you can manipulate the data in the `onBlueBirdChange` function. You could fire actions, ajax calls, all kinds of things. These will nearly always come back to bite you.

The only thing you might want to consider doing in the `onBlueBirdChange` method is some kind of filtering. For example, if we had a lot of BlueBirds, it might be useful to specify that a component is only rendering a specific bluebird. When we get the updates we could filter out any bluebirds that do not match our id. That way `bluebirdBody` represents our bluebird. In fact, Reflux provides the `connectFilter` mixin function for that exactly purpose. 

Now that our store is talking to our component, we need a way to update the store when the user types. This is where `BlueBirdActions` come in handy. We are going to update the `onBodyChange` function, replacing `setState` with an action call.

    onBodyChange: function(newValue) {
      // this.setState({bluebirdBody: newValue});
      BlueBirdActions.inputChange(newValue);
    },

We can also delete `getInitialState`. When we registered our component with the store via `Reflux.connect`, the store's `getInitialState` function is called and merged with the component's `getInitialState`.

Now, when we reload our page (http://localhost:3000/pages/bluebird), we get two text boxes that are actually linked.

![BlueBirds Talking](/content/images/2015/04/BuildingInteractive-003.png)


Bonus Birds
-----------

Just for the fun of it, lets add another component that uses the data slightly differently. We will call it `BlueBirdStats.jsx`.

    var React = require('react')
      , Reflux = require('reflux')
      , BlueBirdStore = require('./BlueBirdStore');

    var BlueBirdStats = React.createClass({
      displayName: "BlueBirdStats",
      mixins: [Reflux.connect(BlueBirdStore, 'somethingElse')],
      render: function() {
        return (
          <div style={{float: 'right', maxWidth: 350}}>
            <div>Body Size: {this.state.somethingElse.length}</div>
            <div>{this.state.somethingElse}</div>
          </div>
        );
      }

    });

    module.exports = BlueBirdStats;

As you can see, it is also a simple component. It connects the BlueBirdStore to the `this.state.somethingElse`. That's right, we can call it anything we want. The component then styles itself as a box floating on the right side of the screen and shows the string length and the actual message.

Finally, we add it to our application. First, add the `BlueBirdStats` component to our `components.js` file, `BlueBirdStates = require('./components/BlueBirdStats');`. Then add it to our `bluebird.html.erb` file, `<%= react_component "BlueBirdStats", {} %>`. Finally, reload the page.

![BlueBird with Stats](/content/images/2015/04/BuildingInteractive-004.png)


More Bonus Birds
----------------

Let's really see how powerful the Flux model can be. Let's connect it to a [Faye](http://faye.jcoglan.com/) server.

First, if you do not already have a Faye server running, it is really easy to add one for demo purposes. Update `package.json` with the required dependencies.

    "dependencies": {
      "faye": "^1.1.1",
      "http": "0.0.0"
    },
    "scripts": {
      "fayeserver": "node fayeserver.js"
    },

Then, add the actual server code.

    var http = require('http'),
        faye = require('faye');

    var server = http.createServer(),
        bayeux = new faye.NodeAdapter({mount: '/'});

    bayeux.attach(server);
    server.listen(8000);

Run `npm install`.

Finally, launch our new Faye pub/sub server: `npm run fayeserver`.

Now that we have a simple pub/sub server running, we only need to modify our store to take advantage.

First, we will establish a connection when the store is created.

    init: function() {
      // client/sub are scoped by var statements at the module level
      client = new Faye.Client('http://localhost:8000/');
      sub    = client.subscribe('/messages', this.onMessage);
    },

`Faye.Client` will establish a connection to our server. We set this up on `localhost:8000` in our `fayeserver.js` file. Then we `subscribe` to the `'/messages'` queue on the server. Anything that is published to that queue will be directed to our `onMessage` function.

Next, we update the `onInputChange` method to post messages to the server when we the user types.

    onInputChange: function(newValue) {
      input = newValue;
      this.trigger(input);
      if(client) { client.publish('/messages', { text: newValue }); }
    }

Finally, we add the `onMessage` function to process messages.

    onMessage: function(message) {
      if(input !== message.text) {
        input = message.text;
        this.trigger(input);
      }
    },

Here we get the message, if it is different from what we already have, we trigger an update.

None of our components changed. We can implement our data layer in the store however we want, and the components just keep working. Also, by keeping all of that logic in the store, it presents one convenient test target.


Bugs
----

Of course there are some bugs, there are always bugs. The biggest one is synchronization with the textarea. You probably did not notice, but typing in our textarea is "buggy". Everything is fine as long as we are appending to the end of the text, but try putting the cursor in the middle somewhere and type a few keys. You get one character at the cursor, and then the cursor jumps to the end of the line. This is a synchronization bug common to React and Flux.

There are no great solutions to this problem. It is inherent to the Flux architecture. However, there are some workarounds that involve adding a slight buffer to the text area. I implemented one such workaround, [lazy-input (GitHub)](https://github.com/HurricaneJames/lazy-input), and published it to [lazy-input (npmjs)](https://www.npmjs.com/package/lazy-input).

Simply add it to the `package.json` dependencies: `npm install --save lazy-input`.

Then, require it in any modules that use `textarea` or `input` fields. So, for example, the render function in `BlueBird.jsx` will become:

    render: function() {
      return (
        <div>
          <span>Enter Some Text</span>
          <LazyInput
            type="textarea"
            value={this.props.content}
            onChange={this.onChange}
            style={this.props.style}
            rows={15}
          />
        </div>
      );
    }

Reload the page, and everything just works.


Store Hydration
---------------

Finally, we should talk a little bit about hydration. Hydrating a store means getting some initial data into the store. There are almost limitless ways to hydrate the store. The version I like involved serializing our data on the backend and attaching it to the body element via data attributes.

In Rails, this can be accomplished by changing the body tag in 'application.html.erb'.

    <body <%= yield :seed_attributes %>>

Then, somewhere in the view chain, add `content_for`. For this demo, we will add it to `bluebird.html.erb`. We should probably consider adding it to `index.html.erb`, but we will skip that to show what happens when no hydration data is present.

    <% content_for :seed_attributes do %>
    data-bluebird-store="an initial message"
    <% end %>

Normally, we would seed with some data from the database, but you get the point. It is possible to pack just about anything into the `data-attributes`. For more complex stores, we generally use JSON. Rails has an awesome `json_escape` helper function you should be sure to check out. Combined with the [jbuilder](https://github.com/rails/jbuilder) gem, it is possible to export some really complex data structures.

Finally, we need to add some code to the BlueBirdStore `init` method to hydrate the store from the data attribute.

    init: function() {
      if(document.body) {
        input = document.body.getAttribute('data-bluebird-store') || "";
      }
    },


One caveat. This only works if the JavaScript is loaded after the body tag has been processed by the browser. If the JavaScript is in the head tag, the seed data will not arrive. Generally speaking, it is considered best practices to load the JavaScript at the end of the HTML, so it has not be a problem for any of our projects.


Conclusion
----------

We walked through adding Reflux to a relatively simple component. We looked at some of the advantages this gave us. We saw one of the big drawbacks, and we solved it. I certainly hope that this has been a useful walkthrough for you.

Don't forget, the completed code is available on GitHub [Dex v3.1](https://github.com/HurricaneJames/dex/tree/v3.1).

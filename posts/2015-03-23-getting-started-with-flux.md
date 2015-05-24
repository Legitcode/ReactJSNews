---
layout: post
title:  "Getting Started with Flux"
author: Josh Perez
date: 2015-03-23 16:32
published: true
categories: react
---
## What is flux?

[Flux](http://facebook.github.io/flux/docs/overview.html) is an application architecture for building complex user interfaces. It eschews MVC in favor of unidirectional data flow. What this means is that data enters through a single place (your actions) and then flows outward through to their state manager (the store) and finally onto the view. The view can then restart the flow by calling other actions in response to user input.

We'll be using [Alt](https://github.com/goatslacker/alt) for flux because it removes away some of the boilerplate, is isomorphic (meaning you can use it to render content server side), and it uses the flux dispatcher under the hood.

The full code for this tutorial is available [here](https://github.com/goatslacker/alt-tutorial).

## Setup

For this tutorial I'll be assuming you're familiar with [React](https://facebook.github.io/react/), [CommonJS](http://www.commonjs.org/), [ES5 JavaScript](https://es5.github.io/), and a subset of [ES6](https://people.mozilla.org/~jorendorff/es6-draft.html) specifically the one that works with react's transform. I'll also assume you're on a modern browser or a node environment. 

## Installing

If you're using a package manager like npm or bower then go ahead and install alt.

```bash
npm install alt
```

## Folder structure

A typical folder structure would like like this

```txt
your_project
|--actions/
|  |--MyActions.js
|--stores/
|  |--MyStore.js
|--components/
|  |--MyComponent.jsx
|--alt.js
|--app.js
```

## Creating your first alt

For this guide we'll be creating a very simple application which has a list of travel destinations and allows you to favorite which ones you're interested in. Let's get started.

We'll be creating an instance of alt, this instantiates a [Flux dispatcher](http://facebook.github.io/flux/docs/dispatcher.html#content) for you and gives you methods to create your actions and stores. We'll be referring back to this file throughout this guide.

In the root of your project, create a new file called `alt.js`.

```js
var Alt = require('alt');
var alt = new Alt();

module.exports = alt;
```

---

## Creating Actions

Actions are how you get data into your stores and then onto your view. They kick-off the dispatch loop and are the single entry point of data flow.

The first actions we create will be simple, they'll take in an array of locations we'll pass in at the start of the application and just dispatch them to the store.

We create an action by creating a class, the class' prototype methods will become the actions. The class syntax is completely optional you can use regular constructors and prototypes.

Inside those actions you can use `this.dispatch` to dispatch your payload through the Dispatcher and onto the stores. Finally, make sure you export the created actions using `alt.createActions`.

`actions/LocationActions.js`

```js
var alt = require('../alt');

class LocationActions {
  updateLocations(locations) {
    this.dispatch(locations);
  }
}

module.exports = alt.createActions(LocationActions);
```

---


## Creating a Store

The store is your data warehouse. This is the single source of truth for a particular piece of your application's state. 

Similar to actions, we'll be creating a class for the store. Also like the actions, the class syntax is completely optional, you can use regular constructors and prototypes.

```js
class LocationStore {
  constructor() {
  }
}
```


Instance variables defined anywhere in the store will become the state. This resembles how we reason about and build normal JS classes. You can initiaize these in the constructor and then update them directly in the prototype methods.

```js
this.locations = [];
```

Next, we define methods in the store's prototype that will deal with the actions. These are called action handlers.
Stores automatically emit a change event when an action is dispatched through the store and the action handler ends. In order to suppress the change event you can return false from the action handler.

```js
handleUpdateLocations(locations) {
  this.locations = locations;
}
```

And then in the constructor, we bind our action handlers to our actions.

```js
this.bindListeners({
  handleUpdateLocations: LocationActions.UPDATE_LOCATIONS
});
```

Finally, we export our newly created store.

```js
module.exports = alt.createStore(LocationStore, 'LocationStore');
```

---


## Using your View

We won't spend too much time on all the parts of the view since it is more about React than it is Flux, however, the important piece is how you listen to stores and get data out of it.

Getting the state out of your store is simple, every alt store has a method which returns its state. The state is copied over as a value when returned so you accidentally don't mutate it by reference. We can use React's `getInitialState` to set the initial state using the store's state.

```js
getInitialState() {
  return LocationStore.getState();
},
```

But then we'll want to listen to changes once the state in the store is updated. In your react component on `componentDidMount` you can add an event handler using `LocationStore.listen`.

```js
componentDidMount() {
  LocationStore.listen(this.onChange);
},
```

And, don't forget to remove your event listener.

```js
componentWillUnmount() {
  LocationStore.unlisten(this.onChange);
},
```

A few [mixins](https://github.com/goatslacker/alt/tree/master/mixins) are available to make this boilerplate go away.

---

## Fetching Data

One of the most common questions people have when they are new to flux is: where should async go?

There is no right answer right now and don't feel bad if you're putting it in actions or in stores. In this tutorial we'll be calling async from the actions and the data fetching will exist in a new folder `utils`. This tutorial will handle fetching the data and failure states.

So we create `utils/LocationsFetcher.js`. We can use something like [fetch](https://github.com/github/fetch) to fetch some data from a server, but for the purposes of this tutorial we'll just simulate an XHR with good ol' `setTimeout` and `Promise` so we copy fetch's API.

Here's some mock data we'll be using

```js
var mockData = [
  { id: 0, name: 'Abu Dhabi' },
  { id: 1, name: 'Berlin' },
  { id: 2, name: 'Bogota' },
  { id: 3, name: 'Buenos Aires' },
  { id: 4, name: 'Cairo' },
  { id: 5, name: 'Chicago' },
  { id: 6, name: 'Lima' },
  { id: 7, name: 'London' },
  { id: 8, name: 'Miami' },
  { id: 9, name: 'Moscow' },
  { id: 10, name: 'Mumbai' },
  { id: 11, name: 'Paris' },
  { id: 12, name: 'San Francisco' }
];
```

So let's create the LocationsFetcher.

`utils/LocationsFetcher.js`

```js
var LocationsFetcher = {
  fetch: function () {
    // returning a Promise because that is what fetch does.
    return new Promise(function (resolve, reject) {
      // simulate an asynchronous action where data is fetched on
      // a remote server somewhere.
      setTimeout(function () {

        // resolve with some mock data
        resolve(mockData);
      }, 250);
    });
  }
};
```

Next, wel'll need to change the actions to use this new method we created. We will add an action called `fetchLocations` which will fetch the locations and then call `updateLocations` when it successfully completes. A new action is also added, `locationsFailed` which deals with the locations not being available. Add these methods to the class.

`actions/LocationActions.js`

```js
fetchLocations() {
  // we dispatch an event here so we can have "loading" state.
  this.dispatch();

  LocationsFetcher.fetch()
    .then((locations) => {
      // we can access other actions within our action through `this.actions`
      this.actions.updateLocations(locations);
    })
    .catch((errorMessage) => {
      this.actions.locationsFailed(errorMessage);
    });
}

locationsFailed(errorMessage) {
  this.dispatch(errorMessage);
}
```

Next we'll update our store to handle these new actions. It's just a matter of adding the new actions and their handlers to `bindListeners`. We'll be adding a new piece of state though, 'errorMessage' to deal with any potential error messages.

`stores/LocationStore.js`

```js
class LocationStore {
  constructor() {
    this.locations = [];
    this.errorMessage = null;

    this.bindListeners({
      handleUpdateLocations: LocationActions.UPDATE_LOCATIONS,
      handleFetchLocations: LocationActions.FETCH_LOCATIONS,
      handleLocationsFailed: LocationActions.LOCATIONS_FAILED
    });
  }

  handleUpdateLocations(locations) {
    this.locations = locations;
    this.errorMessage = null;
  }

  handleFetchLocations() {
    // reset the array while we're fetching new locations so React can
    // be smart and render a spinner for us since the data is empty.
    this.locations = [];
  }

  handleLocationsFailed(errorMessage) {
    this.errorMessage = errorMessage;
  }
}
```

And finally, the view will change slightly. We'll be displaying an error message if it exists and showing a spinner if the content is loading.

```js
componentDidMount() {
  LocationStore.listen(this.onChange);

  LocationActions.fetchLocations();
},

render() {
  if (this.state.errorMessage) {
    return (
      <div>Something is wrong</div>
    );
  }

  if (!this.state.locations.length) {
    return (
      <div>
        <img src="/my-cool-spinner.gif" />
      </div>
    )
  }

  return (
    <ul>
      {this.state.locations.map((location) => {
        return (
          <li>{location.name}</li>
        );
      })}
    </ul>
  );
}
```

---

## Data Dependencies

One of the best features of using Flux's dispatcher is the ability to explicitly declare data dependencies between stores.

Dealing with data dependencies is often tricky and time consuming. This is one of the reasons why flux was originally built. 

Flux comes with this method called `waitFor` which signals to the dispatcher that this store depends on another store for its data.

Say we have a new `FavoritesStore` where you'll be able to mark your favorite locations. We want to update the LocationStore only after the FavoriteStore gets its update.

First lets add a new action to our LocationActions.

`actions/LocationActions.js`

```js
favoriteLocation(locationId) {
  this.dispatch(locationId);
}
```

Next, lets build our FavoritesStore.

`stores/FavoritesStore.js`

```js
var alt = require('../alt');
var LocationActions = require('../actions/LocationActions');

class FavoritesStore {
  constructor() {
    this.locations = [];

    this.bindListeners({
      addFavoriteLocation: LocationActions.FAVORITE_LOCATION
    });
  }

  addFavoriteLocation(location) {
    this.locations.push(location);
  }
}

module.exports = alt.createStore(FavoritesStore, 'FavoritesStore');
```

And finally lets set the waitFor dependency in our LocationStore. But first, make sure you bind the new action to a new action handler in the store.

```js
this.bindListeners({
  handleUpdateLocations: LocationActions.UPDATE_LOCATIONS,
  handleFetchLocations: LocationActions.FETCH_LOCATIONS,
  handleLocationsFailed: LocationActions.LOCATIONS_FAILED,
  setFavorites: LocationActions.FAVORITE_LOCATION
});
```

And lets create the action handler with `waitFor`.

```js
resetAllFavorites() {
  this.locations = this.locations.map((location) => {
    return {
      id: location.id,
      name: location.name,
      has_favorite: false
    };
  });
}

setFavorites(location) {
  this.waitFor(FavoritesStore);

  var favoritedLocations = FavoritesStore.getState().locations;

  this.resetAllFavorites();

  favoritedLocations.forEach((location) => {
    // find each location in the array
    for (var i = 0; i < this.locations.length; i += 1) {

      // set has_favorite to true
      if (this.locations[i].id === location.id) {
        this.locations[i].has_favorite = true;
        break;
      }
    }
  });
}
```

---

## Conclusion

In this guide you've learned about creating actions, creating a store, tying your view to the store updates, dealing with asynchronous data, and dealing with store dependencies.

You can check out the code for the final result [here](https://github.com/goatslacker/alt-tutorial).

If you have any questions feel free to reach out to me on twitter [@goatslacker](https://twitter.com/goatslacker), or hit up the [Alt Support channel](https://gitter.im/goatslacker/alt), and there's also a great community around react and flux over at [Reactiflux](http://reactiflux.com/).
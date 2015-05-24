---
layout: post
title:  "The State of Flux"
excerpt_separator: <!--more-->
author: David Chang
date: 2014-11-06 16:29
published: true
categories: react
---
Facebook announced Flux at F8 in April as an application paradigm to complement React. But Flux has been pretty nebulous, as there hasn’t been much code released. The examples in Facebook’s Flux repository gave a better idea of its overall composition, but there was still a ton of boilerplate involved, and that’s usually where a library comes along to bring some level of abstraction and convenience.

<!--more-->

Facebook announced Flux at F8 in April as an application paradigm to complement React. But Flux has been pretty nebulous, as there hasn’t been much code released. The examples in Facebook’s Flux repository gave a better idea of its overall composition, but there was still a ton of boilerplate involved, and that’s usually where a library comes along to bring some level of abstraction and convenience.

Assuming a prior knowledge of Flux’s inner workings, here’s a comparison of the following Flux libraries that have been developed by the community:

-   Reflux <https://github.com/spoike/refluxjs>
-   Barracks <https://github.com/yoshuawuyts/barracks>
-   Delorean <http://deloreanjs.com/>
-   Fluxy <https://github.com/jmreidy/fluxy>
-   Fluxxor <http://fluxxor.com/>
-   McFly <http://kenwheeler.github.io/mcfly/>

## In keeping with the Action - Dispatcher - Store - View paradigm

-   Reflux merges Actions and the Dispatcher together (so Stores listen to Actions, not dispatched events)
-   Barracks basically removes Action Creators, and very tightly couples the Dispatcher and its Stores together (so the View dispatches events directly)
-   Delorean keeps all the same, but technically doesn’t have singleton Stores
-   Fluxy keeps all the same
-   Fluxxor keeps all the same
-   McFly keeps all the same

## In handling asynchronous requests

General usage within Flux is straightforward - the one thing that is not exactly intuitive is handling asynchronous requests. This could be considered a Flux design pattern question, but general consensus from engineers at Facebook suggest that asynchronous writes actually do not belong in Stores, but in Action Creators. Asynchronous reads could belong in either.

I think it is favorable to handle asynchronous requests in actions rather than stores because:

1.  It is a more consistent pattern to how data flows through the rest of the system
2.  Multiple stores could be interested in listening to the success or failure of a request (such as a generic error handler store), and you typically don’t want to invoke actions from directly within your stores

That said, here are a variety of different approaches to handling/facilitating asynchronous requests:

-   Reflux does not hinder developers from the above convention in any way - one can simply set up action "listeners," which could invoke the asynchronous request and invoke other actions upon completion. This pattern has been illustrated [here](https://github.com/WRidder/react-spa/blob/master/src/actions/resourceActions.js#L24-L51) or [here](https://gist.github.com/simenbrekken/de69d3ce27ea5934c8b2). Regardless, a solution is not necessarily intuitive as it may be in a library like Fluxy
-   Barracks emphasizes the use of waitFor as it actually handles asynchronicity correctly using a concept of middleware chains. This actually seems like it works totally fine for asynchronous writes
-   Delorean doesn’t do anything in particular
-   Fluxy has a built-in concept of serviceActions that directly facilitates asynchronous requests. A serviceAction will send ${ACTION} upon invocation and subsequently ${ACTION}_COMPLETED or ${ACTION}_FAILED upon completion. Fluxy's dispatcher also has a dispatcher that actually handles waitFor correctly (as opposed to just staggering the order of synchronous calls as Facebook’s Flux Dispatcher or Yahoo’s Dispatchr do), supported with the Bluebird Promises library
-   Fluxxor doesn’t do anything in particular (though it contains some good documentation that arrives at the same conclusions as Fluxy)
-   McFly may actually inadvertently not allow multiple events to be dispatched asynchronously from a single action (since it seems to expect a synchronous payload object to be returned). So the action factory may actually hinder putting asynchronous requests in actions and force you to handle it in your stores

## Added Value

-   Reflux actually offers a ton of convenience methods in unique ways you won’t find in these other libraries. Your stores can listen to other stores and aggregate data across other stores. Creating actions and stores for those actions is particularly easy and can be done without a lot of code. The main impetus for Reflux was that the author didn’t like that stores basically had to compare strings to determine what action had taken place and what it should do, which is very fair. The result is that you don’t have to maintain a list of Constants (or compare strings) everywhere like in the Facebook examples - you basically create actions and you set up listeners on those actions, which honestly makes a lot of sense. A side effect of this is that you don't need to maintain true Constants - multiple stores can essentially have the same API, the same action names, and there is no conflict as there would be with other Flux implementations.
-   Barracks boasts a minimal API surface area, which is actually something to behold - there are only 3 functions exposed. But it seems like, in these 3 functions, you can actually get everything you need
-   Delorean boasts that it is framework agnostic (React, Flight, Ractive, etc) and it is small (4K gzipped). It really is the only library that doesn’t seem straight up married to React in its demo code
-   Fluxy leverages Mori in stores for immutable data structures, so that your components’ shouldComponentUpdate can be ridiculously fast, but that also means you need to use Mori syntax for everything within your stores. It also keeps a history of your store state, so you basically get the ability to undo for free. As mentioned above, the idea of serviceActions basically gives you asynchronous actions for free, without any extra work
-   Fluxxor provides convenience create methods for a lot of setup as well as a StoreWatchMixin so that components can listen to Stores without a lot of boilerplate
-   McFly provides helper factories to facilitate the creation of actions and stores. It also contains a typical store listener mixin for components

## Shortcomings

-   Reflux seems a bit bulletproof at this point - it _does_ stray from the "canonical" Facebook Flux architecture, but it still seems fully featured and, to my attention, there are no legitimate architectural concerns
-   Barracks makes a pretty large departure from the canonical Flux architecture by getting rid of action creators and tightly coupling the dispatcher and the stores together. This perhaps comes at the expense of flexibility. If your actions only ever affect one store, there’s no real problem, but if you hypothetically had a single action that should be handled by multiple stores, there’s no good, clean way to handle this (though I wonder how much this happens in the real world). Since Barracks is such a departure from all of these other implementations, if you needed something more conventional later, you’d probably have a hard time migrating and end up having to rewrite/rearchitecture much of your code
-   Delorean doesn’t stray much from the “canonical” Facebook Flux architecture - the only thing is that its stores aren’t singletons, but that’s rather nitpicky
-   Fluxy doesn’t stray much from the “canonical” Facebook Flux architecture
-   Fluxxor doesn’t stray much from the “canonical” Facebook Flux architecture
-   McFly’s helper factory to create actions basically makes you return one payload that will be dispatched (from the documentation, it looks like it needs to be synchronous)

## Takeaways

If you want to stick to Flux as purely as possible, use Fluxxor, Delorean, or McFly.

If you want convenience and novelty, Reflux and Fluxy will give you a pretty fun experience.

If you are feeling rebellious or want a truly minimal surface area, go with Barracks.

## Corrections

7/17/14: Corrections to Reflux

-   Handling asynchronous requests had read: "Reflux’s design doesn’t exactly fit with the above paradigm, since an asynchronous read or write can’t be run from an action. It would have to be run from a Store - if other Stores were interested in whether the action succeeded or failed, you would either have to invoke follow up actions from within the Store or make interested Stores listen to changes in that Store, since that’s also a unique capability of Reflux."
-   Shortcomings had read: "Reflux has a listenTo component mixin to listen to changes in your store, but you still have to do more work than other libraries - you still have to set up both onChange and onInit methods that I’d expect to be equivalent and could be abstracted away if you enforced the presence of a function like getStoreData in either the component or the Store." Actually, Reflux provides a connect method that removes your need for onChange in general cases. You still may need to declare your initial state.
-   Shortcomings had also read: "As aforementioned, Reflux also does not have a straightforward solution to handling asynchronous requests" which was not true and was fixed under the "Handling Asynchronous Requests" section

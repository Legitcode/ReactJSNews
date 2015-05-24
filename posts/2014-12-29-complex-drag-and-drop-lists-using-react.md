---
layout: post
title:  "Complex Drag and Drop Lists using React.js"
author: James Burnett
date: 2014-12-29 16:38
published: true
categories: react
---
*Note: All of the code can be found on [GitHub](https://github.com/HurricaneJames/dex).*

This article covers creating an HTML5 based drag and drop container that accepts items from compatible containers, has nice animations, and only uses React.js (no Flux based architectures). 

Others have written on drag and drop with React.js. It is worth the time to check out some of them. For example, Daniel at webcloud.se has a great article on creating [sortable lists with React](http://webcloud.se/truly-reactive-sortable-component/). He also created a nice [react-sortable component](https://github.com/danielstocks/react-sortable/). Dan Abramov has an awesome react-dnd library up on github, [gaearon/react-dnd](https://github.com/gaearon/react-dnd) with [demo](http://gaearon.github.io/react-dnd/#/dustbin-simple). This library has support for a simple sortable list too.

However, none of the resources seem to cover the case of independent components that allow internal sorting and dragging items between containers. This is not surprising. Such components are very useful, but also fairly specific. 

*Note: The article was updated on Friday, January 2, 2015 to fix a bug when using non-text data in `onDragStart` and `onDrop`.*

Requirements
------------
Recently, we needed a list component that would support different item types as well as drag and drop. The component is part of a migration from a legacy system into a newer React based system, so the containers needed to be completely independent of each other and added via react_component Rails helper. For various reasons, a Flux based architecture was rejected (at least temporarily, though that might be something we experiment with in the near future).

The user experience needs to be similar to the JQueryUI sortable-based widget it is replacing. Items need to be draggable inside the container. Additionally, the original compent had been heavily modified so items were draggable between containers. Dragging should also be highly interactive with smooth animations, making it clear what is happening. As a bonus we wanted to make it easy to add drag and drop support on mobile devices, even though they do not support HTML5 drag and drop.


Initial Setup
-------------
For this article we start with the basic React/Rails setup discussed in an earlier article on [Setting Up Rails for React and JEST](https://reactjsnews.com/setting-up-rails-for-react-and-jest/). This gives a good start point on a simple Rails based app. However, The main techniques used should work with any setup and it should be fairly easy extrapolating to other setups from there.

    # Poor Mans Fork
    git clone https://github.com/HurricaneJames/rex dex
    cd dex
    rm -rf .git
    git init
    git add .
    git commit -m "Rex to Dex"

    # Install required packages
    bundle install
    npm install

    # Start Rails server
    rails s

This setup gives us a view template `app/views/pages/index.html.erb` and a route, `/pages/index`, to get there. All of our components will go into the `app/assets/javascripts/components/` directory. Any global components will be added in `app/assets/javascripts/components.js`. If you are unfamiliar with Rails, open a web browser and go to `http://localhost:3000/pages/index`. At this point, you should see the Rex Demo Component.


Adding Containers to Our View
-----------------------------
In pseudo TDD fashion, we are going to assume that code is already written and work backwards. In our setup we have a `app/views/pages/index.html.erb` view template that is rendered for the user. Adding components to this template is straight forward thanks to the react-rails `react_component` helper.

Although not required, let's change the `<h1>` element to something more useful and delete the old demo component. Also, the app title in `app/views/layouts/application.html.erb` still says Rex. These are minor annoyances, but easily fixed.

Normally, the data will come from a controller or a helper. Since this is just a demo/prototype, we are going to add some ugly code to our view.

    <%
      # NEVER PUT LOGIC LIKE THIS IN A VIEW
      random_words = [
        ["apple", "bannana", "watermelon", "oranges", "ice cream"],
        [],
        ["alpha", "beta", "gamma", "iota"],
        ["hot dog", "mustard", "guava"],
        ["chocolate", "ice cream", "cookies", "brownies"],
        ["dog", "cat", "iguana", "leopard", "bear"]
      ]
    %>
    <% random_words.each_with_index do |random_word_group, index| %>
      <h2>Container <%= index + 1 %></h2>
      <%= react_component 'Container', { items: random_word_group } %>
    <% end %>

This creates an array of arrays, `random_words`, representing the data for each of our containers. Then the view loops over those and adds an `<h2>` element and the `react_component` with the random words as an `items` prop.

Updating the browser shows that the view worked as expected. However, there are no React containers. Opening up the development console shows a big red error. `Uncaught ReferenceError: Container is not defined`. This is good news, it means the browser tried to add the containers, it just could not find the code.


Simple Container Element
------------------------
Now we can add in a container component. First, add the non-existant Container to our `components.js` file, `Container = require('./components/Container');`. Then, create the container component, `app/assets/javascripts/components/Container.jsx`.

    var React = require('react');
    var Container = React.createClass({ displayName: "Container",
      render: function() { return <ul /> }
    });
    module.exports = Container;

Reload the browser and notice that the error went away. Inspecting the DOM shows that React loaded the `<ul>` as expected. Next, we will add the items.

As with all React classes, we will start with props and state.

    // in the Container createClass
    propTypes: {
      items: React.PropTypes.array.isRequired,
      itemTemplate: React.PropTypes.func,
    },
    getDefaultProps: function() {
      return {
        items: [],
        itemTemplate: TextTemplate
      };
    },
    getInitialState: function() {
      return {
        items: this.props.items,
      };
    },

The Container class will accept two props, `items` and `itemTemplate`. The `items` come from the array we passed in. The `itemTemplate` defaults to a `TextTemplate` since our `index.html.erb` does not provide anything. One of the requirements was that containers be able to support different types of data. Setup like this, each container can support a different view of the data, which is what we needed. If one view per container does not meet the needs of other projects, it is possible to pass in the template as part of the items, or to determine the proper template based on some data in the item.

The `TextTemplate` is just a simple span element. By convention we have specified that all templates accept an `item` prop. In this case, that item is just text, so it works perfectly.

    // app/assets/javascripts/components/Container.jsx
    var TextTemplate = React.createClass({ displayName: "Container-TextTemplate",
      propTypes: {
        item: React.PropTypes.any.isRequired
      },
      render: function() {
        return <span>{this.props.item}</span>;
      }
    });

We will also update the `render` function to add the new items and template.

    renderListElement: function(item, key) {
      return(
        <li key={key} style={styles.item}>{item}</li>
      );
    },
    render: function() {
      var items = this.state.items.map(this.renderListElement);
      return (
        <ul ref="container"
            style={styles.container}>{items}</ul>
      );
    }

Notice the `style={}` prop. This is a convention proposed by Christopher "vjeux" Chedeau in his presentation on [React: CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js). Whether this is a good idea or not is debatable, but it worked well for this demo.

    var styles = {
      container: {
        maxWidth: 550,
        background: '#cdc',
        border: '1px solid #777',
        listStyle: 'none',
        margin: 0,
        padding: 2
      },
      item: {
        backgroundColor: '#df90df',
        margin: 3,
        padding: 3
      }
    }


Integrating HTML5 Drag Events
-----------------------------
HTML5 drag and drop is a mess, but a mess that is well supported on modern desktop browsers. There are other libraries that give similar functionality, but they are limited in their own ways. For our project, and thus for this demo, we decided to go with HTML5 drag and drop. The events are not supported in mobile browsers, but libraries like JQuery UI Touch Punch show that it is fairly easy to map touch events to the drag events.

*As a side bar, it might be worth checking out [Hammer.js](http://hammerjs.github.io/) or [Slip.js](https://pornel.net/slip/). Both add some powerful touch based events that also work with a mouse on the desktop.*

HTML5 drag and drop is based on an attribute flag and six events. The attribute flag, `draggable` tells the browser that an element is draggable. The six events are dragstart, dragend, dragenter, dragleave, dragover, and drop. React maps those to onDragStart, onDragEnd, onDragEnter, onDragLeave, onDragOver, and onDrop.

The following code examples come directly from the completed `Container.jsx` available on [GitHub](https://github.com/HurricaneJames/dex) and use the following constants:

    ALLOWED_DROP = "move";
    DRAG_DROP_CONTENT_TYPE = "custom_container_type";

* [`onDragStart`](https://developer.mozilla.org/en-US/docs/Web/Events/dragstart) is called when a drag event is initiated. The passed in event object has a very important property, `dataTransfer`. Unlike most browser events, `dataTransfer` must be modified before the end of the function.

        onDragStart: function(e) {
          var selectedIndex = parseInt(e.currentTarget.dataset.key);
          e.dataTransfer.effectAllowed = ALLOWED_DROP_EFFECT;
          e.dataTransfer.setData(DRAG_DROP_CONTENT_TYPE, this.state.items[selectedIndex]);

          this.setState({ selected: selectedIndex });
        },

    Here we set the `dataTransfer.effectAllowed` to accept `move`. It can be modified to `copy`, `copyMove`, or several others as required. We also call `dataTransfer.setData` with the item we wish to transfer. The data type (`DRAG_DROP_CONTENT_TYPE`) is used when checking if a drag event is coming from one of our containers or from something else, for example dragging a file into the browser or a non-compatible element. It will also be used to retrieve the data on a `drop` event.

    *Edit: this works great with text items, but fails miserable with objects. The fix is to use JSON to stringify the data before setting it.*

        e.dataTransfer.setData(DRAG_DROP_CONTENT_TYPE, JSON.stringify(this.state.items[selectedIndex]));

* [`onDragOver`](https://developer.mozilla.org/en-US/docs/Web/Events/dragover) is called whenever the user drags anything over an element that is listening for the event. We listen for this event on two elements in our list, drop zones and items.

        onDragOverItem: function(e) {
          if(this.containerAcceptsDropData(e.dataTransfer.types)) { e.preventDefault(); } 
          var over = parseInt(e.currentTarget.dataset.key);
          if(e.clientY - e.currentTarget.offsetTop > e.currentTarget.offsetHeight / 2) { over++; }
          if(over !== this.state.hoverOver) { this.setState({ hoverOver: over }); }
        },
        onDragOverDropZone: function(e) {
          if(this.containerAcceptsDropData(e.dataTransfer.types)) { e.preventDefault(); } 
          var dropZoneId = parseInt(e.currentTarget.dataset.key);
          if(dropZoneId !== this.state.hoverOver) { this.setState({ hoverOver: dropZoneId }); }
        },

    By default, `onDragOver` events will reset the current drag operation to `none`, preventing a drop. So the first thing we do is check if we can support any of the dataTransfer types and `preventDefault` if we do. Next, by convention, we have added a `data-key` attribute to our elements that gives us the index in the item array (`currentTarget.dataset.key`). Drop zones then guarante the new key matches the current `hoverOver` value. 

    Dragging over items is a little more complicated. We would like to intelligently select a drop zone and notify the user when dragging over items. Drop zones are animated to expand when they are selected. It looks better if we expand the drop zone above the item when the pointer is in the top half of the item block and the drop zone below otherwise. By convention, item elements have the same `data-key` as the drop zone above them. Therefore, if we are in the bottom half of the item, we bump `over` to be the next drop zone and the effect looks good to the user.

* [`onDragEnter`](https://developer.mozilla.org/en-US/docs/Web/Events/dragenter) "is fired when a dragged element or text selection enters a valid drop target." That is in quotes because it is important. In this case "valid drop target" means the element any element that is listening for `onDragEnter`. Note that children of these "valid drop target[s]" also seem to be valid drop targets that will trigger both `onDragEnter` and `onDragLeave` events, even if we have not attached any listeners. Fortunately, we can ignore `onDragEnter` in this demo because we alert the user to drop zones via `onDragOver`.

* [`onDragLeave`](https://developer.mozilla.org/en-US/docs/Web/Events/dragleave) is like `onDragEnter`, but called on the element that the element was previously over. It also has the same quirk of firing when dragging over children.

    We might be tempted to ignore this one too, but we need it to clean up an ugly user-facing bug. Without `onDragLeave`, draging an item from Container 1, over Container 2, and into Container 3 leaves an empty drop zone highlighted in Container 2.

        onDragLeaveContainer: function(e) {
          var x = e.clientX
            , y = e.clientY
            , top    = e.currentTarget.offsetTop
            , bottom = top + e.currentTarget.offsetHeight
            , left   = e.currentTarget.offsetLeft
            , right  = left + e.currentTarget.offsetWidth;
          if(y <= top || y >= bottom || x <= left || x >= right) { this.resetHover(); }
        },

    `onDragLeaveContainer` is added to the container `<ul>` component and checks to see if the point was on or outside of the container bounding rectangle. If the pointer is outside the rectangle, we know that the `dragleave` event was actually leaving the component and not just entering a child element. When the dragged element leaves the container, we `resetHover` which deselected the drop zone.

* [`onDrop`](https://developer.mozilla.org/en-US/docs/Web/Events/drop) is called when there was a valid drop event. It is during this event that we add the new element into our list.

        onDrop: function(e) {
          var data   = e.dataTransfer.getData(DRAG_DROP_CONTENT_TYPE);
          if(this.state.hoverOver !== NO_HOVER) {
            this.state.items.splice(this.state.hoverOver, 0, data);
            if(this.state.selected > this.state.hoverOver) {
              this.state.selected = this.state.selected+1;
            }
            this.state.hoverOver = NO_HOVER;
            this.setState(this.state);
          }
        },

    First, we grab the data. We already know that `DRAG_DROP_CONTENT_TYPE` is supported because we allowed drop with `onDragOver`. Then we check that a drop zone is active and splice the dropped data into that section of the array. If the selected drop zone is above the selected item, we bump the selected item pointer so it still points to the originally selected item. If the drop is on a different container, then `selected` will be set to `NONE_SELECTED` which will be less than `hoverOver`. Finally, we reset the drop zone pointer as it is now filled with the new element.
    
    *Edit: If the `onDragStart` function was updated for objects, then the onDrop will need to deserialize the data.*
    
        var data = JSON.parse(e.dataTransfer.getData(DRAG_DROP_CONTENT_TYPE));

* [`onDragEnd`](https://developer.mozilla.org/en-US/docs/Web/Events/dragend) is called when the drag operation is over, whether successful or not *(see the "Gotchas" section below for an exception to the rule)*. It is called on the same element that responded to `onDragStart`. It is the very last event called.

        onDragEnd: function(e) {
          if(e.dataTransfer.dropEffect === ALLOWED_DROP_EFFECT) {
            this.state.items.splice(this.state.selected, 1);
            this.state.hoverOver = NO_HOVER;
            this.state.selected = NONE_SELECTED;
            this.setState(this.state);
            return;
          }
          if(this.state.hoverOver !== NO_HOVER || this.state.sele) {
            this.setState({ hoverOver: NO_HOVER, selected: NONE_SELECTED });
          }
        },

    Here we check if the drop effect was successful, ie. `move`. `dropEffect` will be set to `none` when the drop failed or was cancelled. Assuming the drop was successful, the selected item is spliced out of the item array and discarded. `hoverOver` and `selected` are reset regardless.

Binding The Handlers
--------------------
Now that the event handlers are in place we should start using them. First, we need to add some additional items to `getInitialState`.

    selected:  NONE_SELECTED,
    hoverOver: NO_HOVER

Then we need to add the `containerAcceptsDropData` and `resetHover` functions referenced in the handlers.

    containerAcceptsDropData: function(transferTypes) {
      return Array.prototype.indexOf.call(transferTypes, DRAG_DROP_CONTENT_TYPE) !== -1;
    },
    resetHover: function(e) {
      if(this.state.hoverOver !== NO_HOVER) { this.setState({ hoverOver: NO_HOVER }); }
    },

Finally, we need to update our render function.

    render: function() {
      var items = this.renderListElements();
      return (
        <ul ref="container"
            onDrop={this.onDrop}
            onDragLeave={this.onDragLeaveContainer}
            style={styles.container}>{items}</ul>
      );
    }

Render still has responsibility for rendering the list, but now it also listens for `onDrop` and `onDragLeave` events. Previously, items used the common `items.map`. Now, this is extracted to a `renderListElement` function.

    renderListElements: function() {
      var items = [];
      for(var i=0, length=this.state.items.length;i<length;i++) {
        items.push(this.renderDropZone(i));
        items.push(this.renderListElement(React.createElement(this.props.itemTemplate, { item: this.state.items[i] }), i));
      }
      items.push(this.renderDropZone(i));
      return items;
    },

Instead of adding a single `<li>` element for each item, we are adding drop zone elements between all items. We also use also create a template for each of the data items and pass that template off to `renderListElement`. Outside of this demo, it would probably be better to maintain a cache of itemTemplates instead of recreating them on every render. Fortunately, React's virtual DOM keeps the performance snappy anyway.

The actual `<li>` is injected by two render functions, `renderListElement` and `renderDropZone`.

    renderListElement: function(item, key) {
      return(
        <li key={key}
            data-key={key}
            style={merge(styles.item, this.state.selected===key && styles.selectedItem )}
            onClick={this.onClick}
            draggable  ={true}
            onDragOver ={this.onDragOverItem}
            onDragStart={this.onDragStart}
            onDragEnd  ={this.onDragEnd}>{item}</li>
      );
    },
    renderDropZone: function(index) {
      return <li key={"dropzone-" + index}
                 data-key={index}
                 style={merge(styles.dropZone, this.state.hoverOver === index && styles.activeDropZone)}
                 onDragOver={this.onDragOverDropZone}></li>;
    },

Both functions return a `<li>` component that has an appropriate `key` for React. The component also stores that key in `data-key` for easy access in the handlers. We use the style object mentioned above and added a `merge` function to add in style properties for selected items and active drop zones.

List elements are marked as `draggable` and listen for `onDragOver`, `onDragStart`, and `onDragEnd` events. Drop zones are not draggable, but they do listen for `onDragOver` events so that we can tell the browser the zone is a valid drop target (and highlight the drop zone if it is hidden for some reason).

The merge function is taken almost directly from the [React: CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js) presentation. However, that presentation uses ES6 Object.assign, which currently only works with Firefox. So we modified it a bit.

    function merge() {
      var res = {};
      for (var i=0; i<arguments.length; ++i) {
        if (arguments[i]) {
          objectAssign(res, arguments[i]);
        }
      }
      return res;
    }
    function ToObject(val) {
      if (val == null) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
      }
      return Object(val);
    }
    var objectAssign = Object.assign || function (target, source) {
      var from;
      var keys;
      var to = ToObject(target);
      for (var s = 1; s < arguments.length; s++) {
        from = arguments[s];
        keys = Object.keys(Object(from));
        for (var i = 0; i < keys.length; i++) {
          to[keys[i]] = from[keys[i]];
        }
      }
      return to;
    };

The ObjectAssign code was adapted from Sindre Sorhus's [object-assign](https://github.com/sindresorhus/object-assign) code.


User Notification
-----------------
At this point we can drag around items, but it is a little jarring. Stuff appears and disappears rapidly. We can make it better. In a nod to the simplicity of the architecture, the fix only requires modifications to the styles object.

    selectedItem: {
      backgroundColor: '#333'
    },
    dropZone: {
      height: 2,
      backgroundColor: 'transparent',
      transition: 'height 400ms'
    },
    activeDropZone: {
      height: 15,
      background: '#fff',
      transition: 'height 150ms'
    }

The transition properties make the drop zones expand/collapse gracefully. The background colors make it obvoius what is selected and what is a drop zone.

Finally, we have a nice component that can be used as a basis for more custom components that fit specific project needs.


Other HTML 5 Drag and Drop Gotchas
----------------------------------
HTML5 Drag and Drop has a couple of "gotchas" that should be avoided. 

* Dragend is not fired if element is moved. This is marked as a [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=460801) in Firefox, but Chrome does not fire the event either. Also, the drop animation looks like a cancellation. This was a bug that came up when trying to expand Daniel's [Truly Reactive Sortable Component](http://webcloud.se/truly-reactive-sortable-component/) in earlier tests. We handle it by not moving or removing the selected elements. In the "User Notification" section we highlight selected items in a dark grey color. It would be fairly easy to set the position to absolute and the top/left properties to be far off screen.

* WebKit does not trigger CSS `:hover` when dragging. This "gotcha" is only verified on MacOSX, but that was enough to change directions when it cropped up. This comes up when trying to use `:hover` to animate the drop zones, which was the obvious first attempt. Though it worked out well because the final version animates better based on hovering over items too.


Conclusion
==========
This article describes how to create a very specific sortable/exchangable list component. It is useful for a page with multiple containers of items, each with their own way of rendering data. It does not use any kind of Flux architecture or other means of communicating between containers, making each component very independent. Suggestions on how to expand were offered along the way. Hopefully, it has been useful. Comments, as always, are welcome.

*All of the code can be found on [GitHub](https://github.com/HurricaneJames/dex).*

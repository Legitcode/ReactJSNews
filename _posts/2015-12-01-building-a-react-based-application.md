---
layout: post
title:  "Building a React-based Application"
excerpt_separator: <!--more-->
author: Marc Scholten
date: 2015-12-01 17:15
published: true
categories: react
---

Building a frontend application is hard. Compared to building backend applications, you have way too much mutable state to manage and in the end your whole code base is so complex that nobody wants to touch anything.

We already know how to build backend applications - generating html, sending it to the browser, repeat - without it ending in a nightmare of complexity, but building frontend stuff is very complicated. Backend is easy, frontend is hard. So, why don't we just build the frontend like the backend?

<!--more-->

Building a frontend application is hard. Compared to building backend applications, you have way too much mutable state to manage and in the end your whole code base is so complex that nobody wants to touch anything.

We already know how to build backend applications - generating html, sending it to the browser, repeat - without it ending in a nightmare of complexity, but building frontend stuff is very complicated. Backend is easy, frontend is hard. So, why don't we just build the frontend like the backend?

## Building it like a backend application

A good old web application usually consists of a router mapping the current url to a controller action which will render the whole page including the outer layout. The big picture looks like this:

![](http://mpscholten.github.io/assets/good-old-web-application.png)

By replicating this cycle in our frontend application we can - <em>together with react</em> - reach an easier to understand application design with less mutable parts.

# Implementing it
When the user is navigating to a different view, we will just use links. When the user clicks a link an event handler will tell the router to render the new page (by using `window.history.pushState`). Our frontend application flow now looks like this:

![](http://mpscholten.github.io/assets/great-new-react-application.png)

This leads to a one-directional data flow which is easier to reason about than a bidirectional data flow which you can usually find in frontend applications.

Let's take a look to some example code.


# The Application Component 

```js
// Application.jsx
import Router from "./Router"
import { routes as postRoutes } from "./PostView"
import { routes as accountRoutes } from "./AccountView"

class Application {
    render() {
        if (this.state.user) {
            return <Router routes={this._routes()} url={this.state.url}/>
        } else {
            // not logged in
            return <Router routes={this._routesWhenNotLoggedIn()} url={this.state.url}/>
        }
    }

    _routes() {
        // merge the routes of all the modules
        return [].concat(postRoutes(this.state.user), accountRoutes(this.state.user))
    }

    componentDidMount() {
        let oldPushState = window.history.pushState

        window.history.pushState = (state, title, url) => {
            this.setState({url: url, user: state})

            oldPushState.call(window.history, state, title, url)
        };
        window.onpopstate = (event) => {
            this.setState({url: window.location.pathname})
        };

        // after initial page load use the current url to kick off the app
        this.setState({url: window.location.pathname})
    }
}

// Router.jsx
export default class Router {
    render() {
        // find matching regular expression
        let routeIndex = routes.findIndex(route => {
            let regularExpression = route[0];
            return this.props.url.match(regularExpression) !== null;
        });

        if (routeIndex === -1) {
            throw new Error(`${this.props.url} not found`)
        } else {
            let matches = this.props.url.matches(routes[routeIndex][0])
            // call route handler with regex matches
            return routes[routeIndex][1].apply(this, matches.slice(1))
        }
    }
}
```

We have an `Application` component which will intercept `window.history.pushState` calls to rerender the page when the url changes. The `Application` also keeps a user as it's state. The user is just a plain old javascript object[[0]](#note-0). If the user has some relations (e.g. the user has some blog posts) these relations will be part of the user object, so that you only have one single application data state. So the major mutable parts of the whole application are capsulated in the `Application`.

Once the user has logged in `Application.state.user` will be set by calling `window.history.pushState(user, undefined, undefined)` from the login view. [Remember: The first argument of `pushState` can be any javascript object](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState).

If a view is updating the user (e.g. account settings) it will not mutate the user object, instead it will create a copy and update the copy. Then it will use `window.history.pushState(newUser, undefined, undefined)` to push the updated user object to the `Application`[[1]](#note-1). The views always have the latest user object by design, the views cannot get out of sync with the data. Also there is no mutable data, awesome!

The user object is passed down from the `Application` to the views by [currying](https://en.wikipedia.org/wiki/Currying) the route actions (`postAction` in the code below) with the user.


# The Link Component

```js
// Link.jsx
class Link {
    render() {
        <a href={this.props.to} onClick={this._handleClick}>{this.props.children}</a>
    }

    _handleClick(event) {
        event.preventDefault()
        window.history.pushState({}, null, this.props.to)
    }
}
```

A `Link` component will render good old `<a href="..">..</a>` elements, but will intercept the `onClick` event to use `window.history.pushState` instead of doing a real http request.


# The Views

```js
// PostView.jsx
import { accountUrl } from "./AccountView"
class PostView extends {
    render() {
        return <OuterLayout>
            <h1>{this.props.title}</h1>
            <section>{this.props.body}</section>
            <Link to={accountUrl(this.props.user)}>View my account</Link>
        </OuterLayout>
    }
}

function postAction(user) {
    return postId => <PostView user={user} id={postId}/>
}

export const routes = user => [
    [new Regex('^/posts/(\d+)$'), postAction(user)]
]

// AccountView.jsx
export const accountUrl = user =>
    `/my-account`

```

You can see that the view modules only export their routes and their url generator functions. So communication across views only happens via `Links` or more specifically by routing.

It's the views responsibility to display the full page including an outer layout. This is just like a view in [rails](https://github.com/railstutorial/sample_app_rails_4/blob/master/app/views/users/show.html.erb) or [symfony](https://github.com/symfony/symfony-demo/blob/master/app/Resources/views/default/homepage.html.twig). The best way to do this is by introducing an `OuterLayout` component.

# Why not flux

Flux is IMO a great pattern for building hybrid react apps (so not using react everywhere). In case you’re using a pure react based application you don’t need data stores and dispatchers. Data stores and dispatchers lead to mutable state and indirect code. Having multiple data stores also introduces multiple sources of truth, which increases complexity. If your app is only using react for some parts flux is a great solution, but if you are using react for everything you are better of with direct code and immutable data.


# Takeaways

By building your react application like a backend application - introducing clearly seperated views, communicating only via urls - you will archieve a simple single directed data flow. By using immutable data structures the only major state (so, ignoring ui state like animation state) is a tuple of the user data structure and the current url.

<em>Thanks for reading :) If you have any suggestions [let me know](mailto:marcphilipscholten@gmail.com)!</em>

<em>[Follow me on twitter](https://twitter.com/_marcscholten) if you're interested in more of this stuff!</em>

<div id="note-0">
</div>
[0] An example user object could look like this: `{ id: 1, email: 'hello@example.com', posts: [{title: 'My first post', content: 'Lorem ipsum'}] }`.

<div id="note-1">
</div>
[1] Usually you do this after sending an ajax request to the server. With promises this could look like this:
```js
// The user has changed his email via the AccountView
updateEmail(newEmail)
    .then(() => {
        let newUser = Object.assign({}, this.props.user, {email: newEmail})
        window.history.pushState(newUser, undefined, undefined)
    })
    .catch(error => ...)
```
where `updateEmail` is doing an ajax request and returning a [Promise](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise).

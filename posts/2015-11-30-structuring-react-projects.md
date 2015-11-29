---
layout: post
title:  "How to Structure a React Project?"
excerpt_separator: <!--more-->
author: Juho Vepsäläinen
date: 2015-11-30 19:35
published: true
categories: react
---

Programming is a bit like gardening. While trying to keep the bugs out, we prefer to keep everything neat and organized lest we want to end up in the jungle. A poor structure just slows us down and makes it easier for bugs to crawl into the system.

There are multiple ways to structure your project. I believe it is far better to evolve the structure as you go rather than to stick with some dogma. I will go through some basic approaches next to provide some food for thought.

<!--more-->

**Editor's Note:** 

Please check out the [React Indie Bundle](http://www.reactindiebundle.com/). Juho and many other members of the React community help put it together. All of the proceeds go towards awesome people in our community.

Programming is a bit like gardening. While trying to keep the bugs out, we prefer to keep everything neat and organized lest we want to end up in the jungle. A poor structure just slows us down and makes it easier for bugs to crawl into the system.

There are multiple ways to structure your project. I believe it is far better to evolve the structure as you go rather than to stick with some dogma. I will go through some basic approaches next to provide some food for thought.

## Everything in One File

The simplest of projects can fit into a single file. This is how I prefer to deal with my [Webpack configuration](http://survivejs.com/webpack_react/developing_with_webpack/). The greatest benefit of this approach is that you have everything you need in a single file. If you organize your code from top to down, this can be a legit approach.

You could start working on a React project in a similar manner. As you are prototyping, you simply stub out your components in a single file as you are trying to figure out the hierarchy. As the file grows, this will become cumbersome, though. For example dealing with testing will be harder than it should. Merges will be problematic.

## Multiple Files

The obvious way to solve this problem is to start splitting things up. You could begin by pushing your components to separate files like this:

```bash
app $ tree
.
├── components
│   ├── App.jsx
│   └── Note.jsx
├── index.jsx
└── main.css
```

Here *index.jsx* works as the entry point of the application. It uses `ReactDOM.render` to render `App` and gets the party started. `App` in turn does something interesting with `Note`. If I wanted yet another component, you would simply add it below `/components`.

If you wanted to test your components, you would add a separate directory for tests and develop them there. You could even try a test driven approach and think through your component constraints before implementing them.

You can get quite far with this basic structure. It does have its limits, though. How to deal with styling for instance? That *main.css* could grow quite big. That's a scary prospect.

## Components in Their Own Directories

This problem can be solved by adding more structure the system. Here's what you could end up with:

```bash
app $ tree
.
├── components
│   ├── App
│   │   ├── App.jsx
│   │   ├── app.css
│   │   ├── app_test.jsx
│   │   └── index.js
│   ├── Note
│   │   ├── Note.jsx
│   │   ├── index.js
│   │   ├── note.css
│   │   └── note_test.jsx
│   └── index.js
├── index.jsx
└── main.css
```

* Starting the component names (i.e., *App.jsx*) with an uppercase letter makes them easy to discover. The *index.js* files provide us neat entry points to the files so they are easy to consume from elsewhere.
* Each component is a self-contained entity now. We can use for example [CSS Modules](https://github.com/css-modules/css-modules) to underline this point. Extracting these components from the project would be easy now given how self-contained they are.
* The tests related to each component are trivial to find now. We still might want to have a `/tests` directory at the project root in order to deal with higher level tests.

Of course real projects have more complexity than this and the current structure would start to break down with that. Where would you fit your views?

## Adding Views to the Mix

This is likely where opinions begin to diverge. I'll let you duke it out at the comments. Here's a structure I would feel comfortable with:

```bash
app $ tree
.
├── components
│   ├── Note
│   │   ├── Note.jsx
│   │   ├── index.js
│   │   ├── note.css
│   │   └── note_test.jsx
│   ├── Routes
│   │   ├── Routes.jsx
│   │   ├── index.js
│   │   └── routes_test.jsx
│   └── index.js
├── index.jsx
├── main.css
└── views
    ├── Home
    │   ├── Home.jsx
    │   ├── home.css
    │   ├── home_test.jsx
    │   └── index.js
    ├── Register
    │   ├── Register.jsx
    │   ├── index.js
    │   ├── register.css
    │   └── register_test.jsx
    └── index.js
```

As we have routing in place now, `App` became redundant. Most likely some view takes care of its responsibilities now. They simply follow our routing rules and consume components based on their needs.

This structure can scale far further but even it has limits as the project grows. I would suggest adding a concept like "features" between the views and the components. A feature is a component that aggregates them somehow and forms, well, a feature.

## Dealing with Data Concerns

Given most useful applications have to deal with data somehow, our current structure might not quite be enough yet. A lot depends on what kind of architecture you choose. It may make sense to push some of the data concerns within the current structure. Or you may introduce new root level directories such as */actions*, */constants*, */libs*, */reducers*, */stores*, just to give you some idea.

## Conclusion

There isn't one right way to structure your projects. Rather, you should be pragmatic. Sometimes just restructuring a project can help you to bring clarity to it and make it more understandable to yourself and others. I'm very curious to hear what kind of structuring you prefer in your React projects and why. Feel free to comment below.

In order to make it easier to dive into the world of React, we've prepared [a special bundle](http://www.reactindiebundle.com/) with material from indie authors. It's available for a limited time. If you want to deepen your React knowledge, it's a good time to pick it up. I hope you enjoy the books, videos, and consulting included.

---
layout: post
title:  "Component Kits for React Native"
date:   2017-03-07 17:00
excerpt_separator: <!--more-->
author: Stephen Grider
published: true
categories: react, react native
---

You won’t find as many styling solutions for React Native as you will for React JS. This stems from two simple realities:

1. React Native is a much smaller target for component libraries than traditional CSS frameworks. In other words, Bootstrap CSS can be used with any web framework, whereas component libraries for React Native only work with…you guessed it…React Native.
2. Customizing React Native styling isn’t the easiest thing in the world. Many apps demand custom styling, which makes component kits not too useful. In addition, it is challenging to customize each and every component, as the flexibility that you gain with traditional CSS on the web doesn’t carry over easily to component libraries.

With that said, here are a few options.


<!--more-->

You won’t find as many styling solutions for React Native as you will for React JS. This stems from two simple realities:

1. React Native is a much smaller target for component libraries than traditional CSS frameworks. In other words, Bootstrap CSS can be used with any web framework, whereas component libraries for React Native only work with…you guessed it…React Native.
2. Customizing React Native styling isn’t the easiest thing in the world. Many apps demand custom styling, which makes component kits not too useful. In addition, it is challenging to customize each and every component, as the flexibility that you gain with traditional CSS on the web doesn’t carry over easily to component libraries.

With that said, here are a few options.

### NativeBase - [Essential cross-platform UI components for React Native](http://nativebase.io/)

A huge collection of components, most of which look quite nice. That’s the plus side. The down side is that some of the components are somewhat buggy. No offense to the library authors, its just the state of the library - it needs a bit of work. For example, here’s an issue I opened a few days ago when I discovered the swipe deck component crashed when only a single data element was provided: [DeskSwiper throws on single element lists · Issue #562 · GeekyAnts/NativeBase](https://github.com/GeekyAnts/NativeBase/issues/562). The authors fixed it up awfully fast, but, hey, that’s a bug that seems like it could have been caught earlier.

---

### React Native Elements - [react-native-community/react-native-elements](https://github.com/react-native-community/react-native-elements)


This is my personal favorite. The styling is generally platform agnostic; it won’t look out of place using it on either Android or iOS. Each component has simple customization, the docs are solid, and it comes with a good set of icons. This is a no-brainer.

---

### React Native Material Design - [react-native-material-design/react-native-material-design](https://github.com/react-native-material-design/react-native-material-design)


Another solid choice, but mostly only useful for Android. Again, its a bit unsettling to see material design - traditionally a stable of Android devices - on iOS. Besides that, the docs are still a work in progress, as evidenced by the lack of docs for nearly half of the components. Nonetheless, if you’re looking for a material design solution, this is better than nothing. It is also worth noting that the project looks generally unmaintained.

---

### React Native Material Kit - [xinthink/react-native-material-kit](https://github.com/xinthink/react-native-material-kit)

Another material design solution, but much better maintained than React Native Material Design. This one has the added benefit of a nicer customization API for creating your own custom components - see the docs on this. It also has some more dynamic components like progress bars and sliders, which you may not see on other frameworks. Anything that helps save you time to build your app is always a solid benefit.

---

### Do Your Own Styling!

If none of these choices float your boat, you can always learn how to style components from scratch yourself. I have a course on Udemy that will teach you how to make perfectly reusable components for your own projects. Check it out here: [The Complete React Native and Redux Course - Udemy](https://www.udemy.com/the-complete-react-native-and-redux-course/?couponCode=4IJ2N25F)

---
layout: post
title:  "Routing in React Native with Jake Murzy"
date:   2016-09-28 17:00
excerpt_separator: <!--more-->
author: Stephen Grider
published: true
categories: react, react-native
---

Jake Murzy has been hard at work creating a new navigational library for React Native over the last couple of months.  While React JS has the benefit of the highly-regarded React Router, such a comprehensive routing solution doesn’t exist yet in the React Native community.  In fact, React Native’s routing landscape has been in constant upheaval for the last year.  The library itself has official three ‘navigators’ for handling decision making on which components to show the user, including ‘NavigatorIOS’, ‘Navigator’, and - more recently - ‘NavigatorExperimental’.  The open source community likewise has the packages ‘React Native Router Flux’, ‘React Native Router Native’, and ‘React Native Redux Router’, which of which are in various states of completion, or, more commonly, disrepair.

<!--more-->

Jake Murzy has been hard at work creating a new navigational library for React Native over the last couple of months.  While React JS has the benefit of the highly-regarded React Router, such a comprehensive routing solution doesn’t exist yet in the React Native community.  In fact, React Native’s routing landscape has been in constant upheaval for the last year.  The library itself has official three ‘navigators’ for handling decision making on which components to show the user, including ‘NavigatorIOS’, ‘Navigator’, and - more recently - ‘NavigatorExperimental’.  The open source community likewise has the packages ‘React Native Router Flux’, ‘React Native Router Native’, and ‘React Native Redux Router’, which of which are in various states of completion, or, more commonly, disrepair.

[React Router Native](https://github.com/jmurzy/react-router-native) appears to focus on matching the API of the immensely popular React Router package, even going as far as introducing the concept of a URL into React Native, which bucks the notion that only web applications need or deserve a URL.

---

**Today Jake is going to share some of his thoughts about his new library.**

**Q:  Hi Jake!  The React Native library contains several navigation solutions and the surrounding ecosystem has multiple routing libraries.  What made you decide to make your own?**

Hey! Thanks for reaching out. I’ve been eagerly watching what’s happening with navigation on React Native for a while. Until very recently, the whole Navigation scene in React Native was a mess. Navigator was being deprecated in favor of NavigationExperimental and NavigationExperimental wasn’t ready for prime time.

My team was just starting a new project so I tried quite a few of the available solutions. Having successfully used React Router on the web, we were looking for a similar solution. Unfortunately, React Router did not support React Native, and other solutions we found were either very unstable, had a hard time keeping up with upstream changes on each release or the quality of code was quite poor.

NavigationExperimental did most of what we wanted but it was a bit too low level so often times we found ourselves writing navigation related code and you can imagine how this gets tedious fast. The low level nature of NavigationExperimental is really by design to allow abstractions to be built up in higher layers. So to finally answer your question, the project came directly out of my frustration trying to make navigation work on React Native as good as React Router did on the web.

**Q:  What is the strength of your routing system?  Is there any type of app that would be a perfect fit with React Router Native?  Conversely, is there any type of app that *wouldn’t* be a good fit with the library?**

The use cases for React Router Native is pretty much the same as NavigationExperimental—which is the only supported navigation library by the React Native team. React Router Native is a very thin layer on top of NavigationExperimental that offers React Router’s mental model in a native app. Under the hood, it uses React Router for routing and NavigationExperimental for rendering user components. This is a very powerful combination that makes URLs possible on mobile.

Most apps do not have deep-linking capabilities because implementing it for each screen in your app is a challenging task. Even within apps, users are often forced to take screenshots to share information. And for many, it’s vital that their apps support deep-linking. For example, Yelp goes as far to show a share prompt when users take screenshots of business listings. React Router Native enables developers to implement deep-linking in their apps without putting forth much effort. This can pave the way for a more connected app ecosystem.

That being said, we’re still in the early days of React Native figuring out the right abstractions. Navigation on mobile is a challenging task, and having different flavors is only healthier as the community weighs the pros and cons of each approach rather than second guessing best-practices. So I’m hoping to get the community involved to shape the direction of the project.

**Q:  Is React Router Native designed to be used with any of the official Navigation components written by the React Native team?**

Absolutely. One of the primary goals of the project is that we follow React’s “learn once, write anywhere” principle. So you can use the community maintained components, interpolators and pan responders from React Native, and everything is highly customizable if you need instruct NavigationExperimental to do fancy transition animations, etc.

**Q:  The React Router team has somewhat famously rewritten their API several times in the last two years, each time introducing several breaking changes.  Do you hope to keep your library at parity with React Router, breaking changes and all?  Case in point, the V4 release of React Router will introduce an all-new API.**

React Router v4 is a complete rewrite. There was a lot of head-scratching on Twitter over the entire new set of breaking changes. Many people thought v4 should at best have been released under a different name. I'm not sure if I agree with that sentiment though, I understand where it is coming from. React Router v4 is a preview release, and in my opinion, it’s really hard to argue against replacing a foreign API with simple React components. I do hope to keep the library at parity with React Router, and to be honest, v4’s new everything-is-a-component approach makes the integration even easier. So over the next few weeks I’ll be working on v4 support.


**Q: If you were new to React Native, which routing solution would you use?  Why?**

This is a hard one to answer. Eric Vicenti has done a great job on NavigationExperimental and most of the issues have been sorted out by the community over the last few months. So if you’re familiar with Redux concepts and comfortable writing your own reducers to manage navigation state, NavigationExperimental is a great choice.

One that I’m surprised you didn’t mention that deserves more attention is ExNavigation—another fairly new addition to the brewery. It also uses NavigationExperimental and is maintained by Adam Miskiewicz, Brent Vatne and other awesome members of the Exponent community. It feels a bit tied to the Exponent platform, but runs perfectly fine on React Native and is open source. So you’ve got that.

Finally, If you’re just getting started with React Native and all you need is to be able to click a button and have it transition to a different scene but you don’t want it to get in your way when you need to reach in and apply complex navigational patterns, I strongly recommend you take React Router Native for a spin.

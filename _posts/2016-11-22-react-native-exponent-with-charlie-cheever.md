---
layout: post
title:  " Native's Exponent with Charlie Cheever"
date:   2016-11-22 17:00
excerpt_separator: <!--more-->
author: Stephen Grider
published: true
categories: react, react-native
---

React Native continues on a development spree in late 2016.  With an ambitious two-week release cycle, the framework makes rapid progress towards feature and performance parity with its native Android and iOS equivalents.  At the same time, these quick release periods frequently introduce breaking changes, difficulty with setup, and challenges with basic configuration.


Enter Exponent, a tool that promises easier setup, development, and deployment of React Native applications.  Rather than being a replacement for React Native, as it is sometimes confused, Exponent augments React Native by dramatically simplifying the development and deployment processes.  Whereas basic setup with an Android environment to develop with React Native can take over an hour by hand, even for experienced engineers, Exponent shortens the time to start to “Hello World” to a handful of minutes.  

<!--more-->

React Native continues on a development spree in late 2016.  With an ambitious two-week release cycle, the framework makes rapid progress towards feature and performance parity with its native Android and iOS equivalents.  At the same time, these quick release periods frequently introduce breaking changes, difficulty with setup, and challenges with basic configuration.

Enter Exponent, a tool that promises easier setup, development, and deployment of React Native applications.  Rather than being a replacement for React Native, as it is sometimes confused, Exponent augments React Native by dramatically simplifying the development and deployment processes.  Whereas basic setup with an Android environment to develop with React Native can take over an hour by hand, even for experienced engineers, Exponent shortens the time to start to “Hello World” to a handful of minutes.

[Exponent’s](https://getexponent.com/) prime feature is revealed as it’s namesake IDE.  The Exponent IDE is development platform for not only developing apps to test in their respective environment simulators, but also simplifies testing them on real devices.


One of the cofounders of Exponent, [Charlie Cheever](https://twitter.com/ccheever), agreed to answer a few questions about Exponent and its purpose in the community.

---

**Hi, Charlie.  Congrats on the release of Exponent!  One of the toughest aspects of Exponent is understanding what its purpose is.  What is the primary goal of Exponent?**


Thanks :)


Before I worked on mobile software, I spent about 15 years making websites. When I started working on the Quora iPhone app and Android app, it felt like time traveling back to 1993. So many things to worry about that have nothing to do with the product you want to build.


One thing we’re trying to do with Exponent is making it as easy to develop native mobile apps as it is to make websites, or even easier! I think about how I learned to build software as a kid--making games on my TI-85 and making Hypercard stacks--and I want to make it so that the middle school kids of today can make cool stuff for themselves and their friends.

**Basic environment setup of the iOS and Android simulators for developing React Native apps is commonly cited as a headache by new developers.  What does Exponent do to alleviate this pain?**


The biggest thing that Exponent does is take care of everything related to native code for you. So you don’t need to know Swift/Obj-C/Java or even have Xcode or Android Studio to be able to write React Native apps. You write just JavaScript and Exponent has everything else already setup for you.


Since you don’t write any native code with Exponent, just JavaScript, Exponent has a lot of the most popular native modules built in. Native maps, push notifications, Facebook and Google login, camera and camera roll access, contacts, TouchID, and a native video player are all included among other things. We’re always adding more of these as well. We just added full OpenGL support last week and did a game jam and made some mini games with it and are adding sound soon.


We sometimes talk about Exponent as being like Rails for React Native. You could write a website in Ruby on your own. but Rails sets up a bunch of sensible things right off that bat that work together in a coherent way and we kind of do the same thing for React Native. Exponent includes instant app updating as a default, so you can deploy new code and assets with one command in seconds, even faster than most websites can be deployed.


**Even after getting set up with the Android and iOS simulators, testing a React Native app on a real phone can still be a challenge.  How does Exponent make it easier to share apps in progress with would-be users?**


You can actually open any Exponent project that you’re working on in our development app right away. When you develop with Exponent, you get a URL for your project, and you can open that URL on any phone with the Exponent developer app which you can download from the iOS App Store or Google Play Store. You don’t need to jack your phone into your computer--just open the URL.


Another really cool thing about this is that, if you’re working with someone else, you can just send them the URL and they can open it on their phone as well, even if they are halfway around the world.


We’ve done a bunch of work to make this pretty nice, like having `console.log` work even if the phone running your code isn’t plugged into your computer. And you can, of course, open your project on the iOS Simulator or an Android Emulator as well if you prefer.


I know you mentioned a lot of people have trouble getting React Native setup on Android especially. With Exponent, every project works on both iOS and Android from the start and you never have to deal with Android Studio, so the process of getting going is much easier.


**What type, or genre, of application would be a good fit with React Native and Exponent?**


I would actually use React Native for almost any mobile app at this point. Doing development the traditional way (writing Swift/Java/Obj-C code) is just too hard to iterate on when you consider the slowness of the code-compile-copy-run loop and the fact that you have to write your app twice (and then keep it in sync!). The other thing that is an absolutely huge deal here but is sometimes overlooked is the layout engine. It’s much easier to build and change a layout in React Native’s Flexbox than any of the UI libraries that I’ve seen for Java/Swift/Obj-C.


And if you need to do something really intense, like Snapchat live video filters, you can just write your own code as a native module and write the rest of your app in JS.


I would use Exponent for anything I could because it just saves a lot of time and headaches since you don’t need to deal with Android Studio or Xcode. Some people don’t know that you can turn an Exponent project into an app store app for iOS or for Android with just one command.


In general, Exponent will work for you in pretty much every case where just having a mobile website is one of the things that you’re considering. The features are pretty equivalent except that Exponent apps feel like native apps and mobile apps still feel like mobile web apps.


The main reason *not* to use Exponent is if you have some custom native code that you need that isn’t included with Exponent. The most common reasons that people can’t use Exponent are if they need use Bluetooth or HealthKit or something else low level that isn’t built in to Exponent; or if they need to integrate into an existing project (though we are working right now on a solution that will let you do this).


The exception to all this is games. If you are making a mobile game, Unity is probably the best choice for you. But we did add OpenGL support to Exponent recently and had a game jam and I was surprised at how good some of the entries were, so I think that might change.


TL;DR: For apps that aren’t games, always use React Native (if you need to do something super custom, just do it as a native module). If you can, use Exponent (you can most of the time but check our docs to make sure we’re not missing anything you need).



**One aspect of React Native that seems to be undergoing constant flux is its solution for navigation.  Between the built in Navigators and open source solutions, do you have any thoughts on an ideal solution for navigation?**


Short version: I think you should use Ex-Navigation that Adam Miskiewicz (skevy) and Brent Vatne on our team wrote. Skevy in particular has been thinking about navigation in mobile apps and React Native for a long time. Using Ex-Navigation is definitely a better idea than Navigator or NavigatorIOS.


To make things confusing, there is also NavigatorExperimental (yes, that’s different from Ex-Navigation) and ExNavigator (which was made by James Ide and Ex-Navigation is based on). The good news is that everyone working on these problems got together and decided to merge them all together. I don’t know how long that is going to take but it will probably be released sometime in the next few months under the name React Navigation, and that should unify everyone’s efforts!


There is also this other school of thought where some people like to use the platform-specific native code for navigation which is the approach that the Wix Navigator uses. I have a strong personal view that its preferable to write UI components like this in JS because I actually think you want your app to be the same across iOS and Android (they are both just black rectangles with touch screens!) and JS tends to make your code more composable and customizable.


Use Ex-Navigation and keep an eye out for React Navigation! Use JS instead of native for this UI code!


**Given the increasingly fast development and deployment times, handling API setup for dealing with data is becoming a large obstacle to React Native apps.  Do you have any thoughts about the use of Backend-As-A-Service solutions like Firebase compared to rolling your own API with Node/Express, Rails, or similar?**


I don’t have a strongly held view on this right now. There are so many solutions that fit the use cases of people with different needs. We’re seeing things getting easier and easier in every direction that you look.


If you want to write your own code and you’re using JS, you can use something like Zeit’s new `now` stuff to deploy essentially instantly. If you want a more general purpose solution, Heroku is also really easy. And then of course there is AWS and Google Cloud, etc.


It’s trivially easy for React Native apps to communicate with essentially any backend that uses HTTP/JSON since `fetch` and `JSON.parse` are built-in.


If you don’t want to write any code, it seems like Firebase has become the most popular solution since Parse announced its shutdown. One nice thing about Firebase is that you can use their hosted database stuff with React Native using just JS, which means it works just fine with Exponent. Someone wrote up a guide to how to do this here: [https://gist.github.com/sushiisumii/d2fd4ae45498592810390b3e05313e5c](https://gist.github.com/sushiisumii/d2fd4ae45498592810390b3e05313e5c)


Longer term, it seems like something like GraphQL/Relay should become really popular, but that stuff is too hard to setup and use still to be mainstream just yet. I’m not sure whether it will be GraphQL/Relay maturing and getting revised that wins or something else that is slightly different and easy to think about as a developer that comes and beats it, but directionally, it’s definitely right. We built something like this at Quora and it saved a ton of development time.


I would just use whatever you are most comfortable with -- almost anything will work! React Native is really similar to the the web in terms of its client capabilities and so I would just think about a React Native or Exponent app as being mostly like a website.

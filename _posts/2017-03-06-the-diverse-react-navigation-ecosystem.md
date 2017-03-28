---
layout: post
title:  "The Diverse React Navigation Ecosystem"
date:   2017-03-06 17:00
excerpt_separator: <!--more-->
author: Stephen Grider
published: true
categories: react, react native
---

The routing ecosystem around React and React Native is quite different. One is characterized by a strong incumbent, and the other is plagued by rapid change.


<!--more-->

### React JS

No question about it, React Router ([ReactTraining/react-router](https://github.com/ReactTraining/react-router)) is king here. They have the benefit of several years of active development, along with an active community submitting PR’s, fixes, etc. Supplement that with myriad tutorials and how-to’s and you end up with a well-supported, stable product. To be fair, React Router has suffered some major API upsets, and is nearly the poster-child for javascript fatigue but the maintainers have declared their lasting support for a few specific versions, which means you can plop down with V3 and be good to go for the next 12 to 24 months.

### React Native

Ok, this is where things start to get really, really crazy. The most important thing to keep in mind is that the React Native team has produced three navigation helpers: NavigatorIOS, Navigator, and NavigatorExperimental.

* NavigatorIOS was quickly deprecated, as it was supported only by (you guessed it) IOS.
* Navigator is the currently endorsed solution for navigation, at least if you are following the official docs. However, its about to be upset by-
* NavigationExperimental. This is an updated navigator that has learned some lessons from Navigator, and has some solid integration with Redux. ‘Navigator’ is (or was!) sleighted to be deprecated in favor of NavigationExperimental at some point.

Already you have three ‘official’ navigators supported by the React Native team. The big issue with all three of these is that they are somewhat lightweight and don’t include a lot of common navigation situations out of the box, like sidebars, tab bars, headers, etc. To solve that, the community has introduced…

* React Native Router Flux ([aksonov/react-native-router-flux](https://github.com/aksonov/react-native-router-flux)). My personal favorite, this is router is based upon NavigationExperimental. You can imagine that the authors looked at NavigationExperimental, realized that everyone would be writing the same wrapper code around it, and so created this project.
* React Native Router (t4t5/react-native-router). Haven’t used it, but it is colossally popular.
* React Router Native ([jmurzy/react-router-native](https://github.com/jmurzy/react-router-native)). Strives for API conformity with React Router (the above mentioned one). The great approach here is that they bring in the concept of a URL in native apps, where one doesn’t otherwise exist. This is a great approach that simplifies a lot of common routing situations.
Of course, there’s one more big solution that is supposedly going to become the standard:
* React Navigation ([react-community/react-navigation](https://github.com/react-community/react-navigation)). Seen as a solution that will soon be ‘official’ in the community, it is intended to replaced NavigationExperimental. This package is still in active development, so I expect at least a bit of API upset over the coming months. If you want to use official solutions, go with this, if you want a tried and true solution, go with React Native Router Flux.

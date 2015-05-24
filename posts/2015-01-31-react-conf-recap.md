---
layout: post
title:  "React Conf Recap"
author: Zach Silveira
date: 2015-01-31 17:17
published: true
categories: react
---
After live tweeting the whole conference this past week, I feel obligated to write up on it. I'll be covering the main stuff announced, at any point feel free to leave a comment or a reply on Twitter [@ReactJSNews](http://twitter.com/reactjsnews) with any questions. I try my best to respond to everyone.

##React Native

This is the most talked about thing that has come from this conference. The React team has been working on a way to solve problems with building native apps. React Native allows you to use React like you normally would, but with new native-specific components. It will allow you to code once and ship an android and iOS app simultaneously. Not only does this help further the team's "Learn once, write everywhere" concept, it is even more practical than that. This tweet sums it up nicely.
<blockquote class="twitter-tweet" lang="en"><p>React is now iOSmorphic too... <a href="https://twitter.com/hashtag/reactnative?src=hash">#reactnative</a></p>&mdash; Jeff Winkler (@winkler1) <a href="https://twitter.com/winkler1/status/560509563485843456">January 28, 2015</a></blockquote>

If you don't get it, you really shouldn't be using React. On a more serious note, the coolest points about RN is live reloading. No waiting for it to compile your app after making a code change. The project is still in its infancy, there isn't really a complete routing solution, which is understandable considering it's not even public yet. The good news is that the [react-router](https://github.com/rackt/react-router) team has verbally committed to making it compatible with RN. 

If you're curious about what these React Native components look like, I posted a picture from the conference:
<blockquote class="twitter-tweet" lang="en"><p>Native components. <a href="http://t.co/X8BtTEuWk6">pic.twitter.com/X8BtTEuWk6</a></p>&mdash; ReactJS News (@ReactJSNews) <a href="https://twitter.com/ReactJSNews/status/560861371697332225">January 29, 2015</a></blockquote>
One of the top features here is the fact that [@Vjeux](http://twitter.com/vjeux) brought over full [flexbox](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Flexible_boxes) compatibility into React Native. So you can style things the way you're used to doing on the web.

Everytime I remember another awesome feature that RN has, I keep wanting to say that it's the best feature, they're all just so awesome. The next thing it can do is use any npm module you're already using. It'll work out of the box!

If you were curious about how good the gestures are in a React Native app, Pete Hunt sums it up pretty well.
<blockquote class="twitter-tweet" lang="en"><p>btw, it&#39;s really good: <a href="https://twitter.com/jordwalke">@jordwalke</a> (react native guy) often uses a slow-mo camera to ensure <a href="https://twitter.com/hashtag/reactnative?src=hash">#reactnative</a>&#39;s touch gestures are solid</p>&mdash; Pete Hunt (@floydophone) <a href="https://twitter.com/floydophone/status/560881445325926401">January 29, 2015</a></blockquote>
Another good tweet from an iOS developer confirms that RN is really good.
<blockquote class="twitter-tweet" lang="en"><p>People asked why I like React&#39;s model over UIKit&#39;s: it does a better job of promoting isolation and confining effects, while being simpler.</p>&mdash; Andy Matuschak (@andy_matuschak) <a href="https://twitter.com/andy_matuschak/status/560675254654078976">January 29, 2015</a></blockquote>

You can see a deep dive into RN [on youtube](https://www.youtube.com/watch?v=7rDsRXj9-cU).

##Relay & GraphQL

Relay was mentioned a little, but after talking to some members on the team, I found out it'll be months before it's actually released. This is a shame because it solves the missing piece with Flux. It is a full framework that uses React and GraphQL. GraphQL, is a new way to fetch data from your backend and is meant to be a replacement for REST. What's really nice about it is that inside of your components you define the data you're checking. Not that much is known other than the fact that you can delay certain data from loading in your app if you need to. Facebook loads posts and then after that is finished, in a non-blocking way of course, then comments are fetched. You'll also be able to slowly migrate flux apps over to Relay. I'm very interested in seeing what this framework will have to offer.

##What's Next
You can see all of the conference talks [on youtube](https://www.youtube.com/playlist?list=PLb0IAmt7-GS1cbw4qonlQztYV1TAW0sCr). I hope you liked my recap of the conference. 

After asking people on Twitter if there's any React jobs available I got an overwhelming response. I'm currently working on a job board built using React that'll hopefully be up soon. For now I'll continue to send out jobs and other secret stuff in the newsletter. You can subscribe to that in the sidebar!
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
---
layout: post
title:  "Tool for Converting CSS to React Inline Styles!"
excerpt_separator: <!--more-->
author: Jason Jarrett
author_url: http://staxmanade.com
date: 2016-05-02 17:00
published: true
categories: react, styles
---

A simple little tool that helps translate plain CSS into the React in-line style specific JSON representation. Making it easy to copy and paste into an inline React component.

<!--more-->

<a target="blank" href="http://staxmanade.com/CssToReact/">
    <img align="right" src="http://staxmanade.com/CssToReact/images/CssToReact-logo.svg">
</a>

### TL;DR

A simple little tool that helps translate plain CSS into the React in-line style specific JSON representation. Making it easy to copy and paste into an inline React component.

Click [here](http://staxmanade.com/CssToReact/) or the logo to jump the tool...

## The More Info Stuff

So you're working on a React app. It's up and running in you're favorite browser but you notice an issue with some layout. You think, ok, this should be easy to fix. You open up the developer tools, hack on some CSS within the browser till you get it looking just the way you want it to. Maybe it's several CSS properties you added or tweaked so you copy each of them into the clipboard so you can transfer them back to your application.

Then you realize, these styles aren't coming from a CSS style sheet, they're in-line styles right in you're React component.

Now you're like, FINE, I'll manually translate this to React-style-inline-CSS. This is no biggie if you do it once in a while. Except that time when you missed removing a dash or mis-cased a letter or maybe you forgot a JSON comma, or left a CSS semicolon. Never happened to you? Oh, you are so amazing if only I was as super cool as you. For myself and probably another 1 or 2 of you out there these problems do come up, but don't have to.

I hacked together a [little tool](http://staxmanade.com/CssToReact/) that automates this translation. Allows you to paste you're `CSS` into a `textarea`, it translates to React inline style JSON CSS and you can copy it out while avoiding translation bugs.

You can see the project here: [CssToReact](http://staxmanade.com/CssToReact/)

If you have a suggestion or want to pull-request it your self you can check it out here: [Source to Project](https://github.com/staxmanade/CssToReact)


This was originally published at [staxmanade.com/2016/04/easily-convert-css-to-react-inline-styles/](http://staxmanade.com/2016/04/easily-convert-css-to-react-inline-styles/)

---
layout: post
title:  "Bring your animations to life with physics"
date:   2016-01-14 09:00:09 +1300
excerpt_separator: <!--more-->
author: Thomas Clarkson
published: true
categories: react, angular
---

Improve your user's experience with animations. Learn about CSS and Javascript animations and when to use them.
<!--more-->

#### Getting started with animations

To animate is to transition the user interface from one display to another. Animation enhances user experience, providing feeback to user actions and making screens that haven't been introduced before easier to understand.

An example can be seen with this [React Material UI datepicker](http://www.material-ui.com/#/components/date-picker). 
The animations respond to user input and inform the user with transitions that show they are moving back or forward when they change month or select a date.

![materialpicker](https://cloud.githubusercontent.com/assets/2054503/12336337/ede568fe-bb68-11e5-8750-7cf50c46a7c7.gif)

This post will compare using CSS transitions based on time against using spring phsyics to animate transitions. We will use the example of transitioning a box from left to right (You could imagine this being a month view in a calendar that we slide in and out of view).

<script src="http://codepen.io/assets/embed/ei.js"> </script>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

#### Example with no Animation

We will build on this example which doesn't have any animation. Without animation the transition is jarring and doesn't show the user where the item is moving from and to. Look at the code in the Babel tab and see that we use transform: translateX rather than setting the left position because left, top, right, bottom are positioned by the CPU and cause a repaint while items using translate are positioned by the GPU and therefore more performant.

<pre class="codepen" data-height="150" data-type="result" data-href="GoEKLN" data-user="TomClarkson" data-safe="true"> <code> </code> <a href="http://codepen.io/TomClarkson/pen/GoEKLN">Check out this Pen!</a> </pre>

#### Using timed CSS animations

A CSS transition can be added to the properties of an element with the CSS transition property. Per the [Mozilla docs for transition](https://developer.mozilla.org/en/docs/Web/CSS/transition), we can pass the duration we want the transition to take and a cubic bezier timing function. In this case I have set the duration to 0.5s and used the default timing function of ease. 

<pre class="codepen" data-height="150" data-type="result" data-href="xZrZJp" data-user="TomClarkson" data-safe="true"> <code> </code> <a href="http://codepen.io/TomClarkson/pen/xZrZJp">Check out this Pen!</a> </pre>


#### Cubic Bezier

![Cubic Bezier Curve](https://cloud.githubusercontent.com/assets/2054503/12335516/79b72d54-bb64-11e5-8fbe-b2a9e6715ea9.png)

A cubic bezier curve is a timing function that starts at position 0 and time 0 and ends at 1,1. It accepts four arguments (x1, y1, x2, y2), which are the two control points to determine the shape of the curve. As you can see above, the ease function accelerates at the start and then decelerates at the middle, causing the animation to 'ease' as it finishes. The ease function is just shorthand for cubic-bezier(0.25,0.1,0.25,1). If you want to prove this, re-run this example after changing line 18 to: 

~~~js
  transition: '0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
~~~

The [cubic bezier site by Lea Verou](http://cubic-bezier.com/) is a great resource for experimenting with different timing functions. Below I have compared a linear function against the ease function. 

![cubicbeziercom](https://cloud.githubusercontent.com/assets/2054503/12336020/f5c3568c-bb66-11e5-84e8-762a41ba4d58.gif)

Chrome dev tools allow you to experiment with different curves and also control the speed of animations as seen below.

![chromebez](https://cloud.githubusercontent.com/assets/2054503/12336063/4134261e-bb67-11e5-8bbd-4981028659a7.gif)

#### Why you should use spring physics in animations

![damped_spring](https://cloud.githubusercontent.com/assets/2054503/12336758/ff68ac10-bb6a-11e5-9560-15737d665b4d.gif)

As cubic bezier functions only give you two points of control, it doesn't give the developer enough control to model real life movement. However, by controlling the animation with Javascript, we have full control and can use Hooke's law which expresses how springs extends and contract. Spring animation is already very popular and can be used to provide lively animations in iOS core animation, and in Facebook's Pop and Rebound libraries. 

Look at the cubic bezier animations on the left taken from [framerjs](http://framerjs.com/learn/basics/animation/), compared with the spring animation on the right. The spring animation has a bounce effect - which is not possible with a cubic bezier function. You could acheive this animation with CSS by using key frames, but you would have to hard code the key frame values and duration of the animation.

![framer](https://cloud.githubusercontent.com/assets/2054503/12362208/f52638fa-bc26-11e5-895e-59c0ad611928.gif)

React Motion implements a terse API for you to use spring animation which can be used on the web and with React Native. You have the option to specify the start value (in this case, 0) and the spring physics values you want to animate to. React Motion runs in a request animation frame. The Motion component will keep calling your function to render your animated component with a style object that has the calculated values for each frame. In the example below I have destructured the x property and rendered it in the component.

<pre class="codepen" data-height="150" data-type="result" data-href="EPwWOg" data-user="TomClarkson" data-safe="true"> <code> </code> <a href="http://codepen.io/TomClarkson/pen/EPwWOg">Check out this Pen!</a> </pre>

##### Continuous fluid interfaces

In the excellent talk on the [state animation in React](https://www.youtube.com/watch?v=1tavDv5hXpo), Cheng Lou, the creator, highlighted a quote from a former UIKit engineer at Apple.

<blockquote class="twitter-tweet" lang="en-gb"><p lang="en" dir="ltr">Animation APIs parameterized by eg duration and curve are fundamentally opposed to continuous, fluid interactivity.</p>&mdash; Andy Matuschak (@andy_matuschak) <a href="https://twitter.com/andy_matuschak/status/566736015188963328">February 14, 2015</a></blockquote>

In the talk, Cheng used an example of animating an opening menu to illustrate this point - "For example, if you have a menu deploy animation that takes 500 milliseconds, and half-way the user clicks on something, and you toggle it back to its initial hidden state, why should this way back also be 500 milliseconds? And also, what should the curve be: ease-in, linear? It is not very clear".

![calendardemosmall](https://cloud.githubusercontent.com/assets/2054503/12363885/3f87eebc-bc30-11e5-9ceb-40e2ad34700f.gif)

The need for a fluid interface is what made me look into react-motion. We are currently building a calendar at [Fergus](http://fergusapp.com/) which requires the ability to respond to drag events and clicks moving the calendar in different directions and by different distances. When we prototyped this with CSS transitions, it was janky and felt slow.

Compare how fluid the spring motion animation is against the CSS animations by clicking the 'Run animation' button multiple times in quick succession.

<pre class="codepen" data-height="450" data-type="result" data-href="dGVvEJ" data-user="TomClarkson" data-safe="true"> <code> </code> <a href="http://codepen.io/TomClarkson/pen/dGVvEJ">Check out this Pen!</a> </pre>

#### Configuring React Motion

The React Motion spring takes two arguments: stiffness and damping (which defaut to 120 and 17, respectively). Four [presets](https://github.com/chenglou/react-motion/blob/master/src/presets.js) are provided: noWobble, gentle, wobbly, and stiff. By adjusting the stiffness and damping below, you can watch how these factors change the animation.

<pre class="codepen" data-height="300" data-type="result" data-href="OMxmQL" data-user="TomClarkson" data-safe="true"> <code> </code> <a href="http://codepen.io/TomClarkson/pen/OMxmQL">Check out this Pen!</a> </pre>

#### When to use CSS Animations

As Cheng said in his talk, CSS animations are better for animations that you don't want to stop or adjust after they are triggered - such as Twitter's exploding heart animation. This is because CSS animations are more performant. React Motion does incur the cost of having your app re-rendered every animation frame which could be a problem if your application is not performant.






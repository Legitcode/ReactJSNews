---
layout: post
title:  "React DataGrid DataTable Component"
date:   2017-02-25 17:00
excerpt_separator: <!--more-->
author: Shon Fernandez
published: true
categories: react
---

ReactJS is an excellent library for building dynamic interfaces. However, it does not ship with a UI component set. 
There are number of community driven options available, including material-ui, react-bootstrap, and more. 
However, none of these component sets come with a fully featured DataGrid component. Here at [reactdatagrid](http://reactdatagrid.com) 
we are trying to provide this important building block to React Enterprise application developers.

<!--more-->

By fully featured DataGrid component, I mean a
datagrid that in addition to basic DataGrid Features like
Ability to organize information as rows and columns, locked headers, Draggable, Resizable, Sortable and Editable Columns,
Keyboard Navigation, Accesibility Support,  Inline Filtering,  Server and Client Paging,  Summary Footers,Export to Excel, Word, Text, XML,
Preference Persistence (Ability for your end users to save viewing preferences, like column order, visibility, widths, 
filter criteria, print settings etc.), Hierarchical Grids (Tree Grids), Virtual (Buffered) rendering, Row Span and Column Span and more.
 
Our company has been building DataGrid components for over a decade now - and we have recently released http://reactdatagrid.com
 
 This is a React based datagrid component - which unlike other options on the market has been written in Pure React.
 Most other alternatives are basically React wrappers around JavaScript or jQuery components. This is less than ideal. 
 
 First, the big problem here is that you lose context as you go from the React part of your page to the jQuery (or plain JS)
 part. React and the third party library conflict in wierd ways because they both want to control the DOM. Not with us 
 we are pure React, so we hand over the virtual DOM to React to render.
 
 The second issue is performance. IF you use React components within the cells of the grid that is not written in pure react,
 you have to do something like 
 
 ReactDOM.render(<YourComponent/>, cellDOMElement)
 
 This is dramatically slower than if you had a pure react datagrid like ours - where you do something like
 
 itemRenderer = {()=> { return <YourComponent/>} }
 
 With our React DataGrid, you get a pure React component with solid featureset that has been battle
 tested with our over a decade of experience writing DataGrid components..
 
 For more information, please visit [reactdatagrid](http://reactdatagrid.com) 
 
 
                           

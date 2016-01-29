---
layout: post
title:  "React and ag-Grid - the Perfect Match"
excerpt_separator: <!--more-->
author: Niall Crosby
author_url: https://www.ag-grid.com/
date: 2016-01-28 00:05
published: true
categories: react
---


### What is ag-Grid

ag-Grid is an enterprise JavaScript data grid with zero library dependencies, including no dependency for it's rendering. You can build an application using just JavaScript and ag-Grid alone. The 'ag' stands for framework AGnostic.

### And React?

Now ag-Grid is providing an optional React component and React rendering. ag-Grd is fully in bed with React and treats React as a first class component - meaning if you are using React, ag-Grid is NOT using any other framework to get the job done.

React Components follow standard DOM interaction patterns using properties, events (callbacks) and an optional API for interacting with the components. React also uses immutability to assist state management. ag-Grid uses the same principles. ag-Grid's core interface maps directly onto what is required by React making ag-Grid and React match perfectly.

To demonstrate, lets take an example of the provided example
[example React and ag-Grid on Github](https://github.com/ceolter/ag-grid-react-example)

~~~js
    render() {
        return (
            // ag-Grid comes with a React Component waiting to be used
            <AgGridReact

                // listen for events with React callbacks
                onRowSelected={this.onRowSelected.bind(this)}
                onCellClicked={this.onCellClicked.bind(this)}

                // binding to properties within React State or Props
                showToolPanel={this.state.showToolPanel}
                quickFilterText={this.state.quickFilterText}
                icons={this.state.icons}

                // column definitions and row data are immutable, the grid
                // will update when these lists change
                columnDefs={this.state.columnDefs}
                rowData={this.state.rowData}

                // or provide props the old way with no binding
                rowSelection="multiple"
                enableSorting="true"
                enableFilter="true"
                rowHeight="22"
            />
        );
    }
~~~


ag-Grid then goes one step further, it embraces React for rendering. That means you can use React for custom cell rendering inside the grid. You provide ag-Grid with the React component and it knows what to do with to seamlessly integrate. No other grid on the market is both agnostic and still allows you to use React for rendering.

ag-Grid's future is bright. It's abaility to integrate with the different frameworks makes it strongly positioned to be the enterprise level data grid everyone was waiting for. You won't need to throw away your grid next time you want to move to a different framework.

To find out more about ag-Grid, visit [www.ag-grid.com](http://www.ag-grid.com/).

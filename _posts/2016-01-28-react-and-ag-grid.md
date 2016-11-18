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

<!--more-->

### And React?

Now ag-Grid is providing an optional React component and React rendering. ag-Grd is fully in bed with React and treats React as a first class component - meaning if you are using React, ag-Grid is NOT using any other framework to get the job done.

React Components follow standard DOM interaction patterns using properties, events (callbacks) and an optional API for interacting with the components. React also uses immutability to assist state management. ag-Grid uses the same principles. ag-Grid's core interface maps directly onto what is required by React making ag-Grid and React match perfectly.

To demonstrate, lets break down the provided
[example React and ag-Grid on Github](https://github.com/ceolter/ag-grid-react-example).
(note: the example can be found running [here](https://www.ag-grid.com/best-react-grid/index.php))

~~~js
    render() {
        return (
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

### Component

The AgGridReact class is the React Component that provides the interface into ag-Grid.

### Configuration mapped to Props

All of the configuration for ag-Grid is done through React props, as always taking values
from the parent state and props. For example, the data to display is provided as the
rowData property:

~~~js
<AgGridReact
    ...
    rowData={this.state.rowData}
    ...
~~~

Refer to [properties documentation](https://www.ag-grid.com/javascript-grid-properties/index.php) for all the properties.

ag-Grid, behaving like a typical React application, treats rowData as immutable. So when
you replace the rowData with a new array of data, the grid will pick this up
automatically.

### Events mapped to Callbacks

The ag-Grid component generates events to inform when things happen in the grid, such
as rows are selected, cells are clicked etc. These events map onto React callbacks
when you provide the callback through one of the props.

~~~js
<AgGridReact
    ...
    onRowSelected={this.onRowSelected.bind(this)}
    onCellClicked={this.onCellClicked.bind(this)}
    ...
~~~

Refer to [events documentation](https://www.ag-grid.com/javascript-grid-events/index.php) for all the events.

### API

The grid is a stateful component and needs to allow you to change it's state. For example,
the grid keeps state as to what rows are selected, and you need to tell it to change
this state by telling it what rows to select. To do this, you use the grid's API.

When the grid initialises it fires a 'ready' event that, as well as telling you the
grid is ready, provides you with a reference to the API.

~~~js
<AgGridReact
    ...
    onReady={this.onReady.bind(this)}
    ...

onReady(params) {
    //store the api
    this.gridApi = params.api;
}

    // then sometime  later
    this.gridApi.selectAll();
~~~

Refer to [API documentation](https://www.ag-grid.com/angular-grid-api/index.php) for the full API.

### In Grid Rendering

And then ag-Grid then goes further, it embraces React for rendering. That means you can 
use React for custom cell rendering inside the grid. You provide ag-Grid with the React component
and it knows what to do with to seamlessly integrate.

The following shows the skills cellRenderer from the sample application. As you can see,
it's pure React, short, to the point, compact, nice!

~~~js
export default class SkillsCellRenderer extends React.Component {

    render() {
        var skills = [];
        var rowData = this.props.params.data;
        RefData.IT_SKILLS.forEach( (skill) => {
            if (rowData.skills[skill]) {
                skills.push(<img key={skill} src={'images/skills/' + skill + '.png'} width={16} title={skill} />);
            }
        });

        return <span>{skills}</span>;
    }

}
~~~

### Summary

ag-Grid and React match up perfectly, giving you an enterprise data grid for use inside you React application.

To find out more about ag-Grid, visit [www.ag-grid.com](http://www.ag-grid.com/).

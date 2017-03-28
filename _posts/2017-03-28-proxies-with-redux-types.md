---
layout: post
title:  "Using Proxies with Redux Types"
date:   2017-03-28 16:00
excerpt_separator: <!--more-->
author: Alec Barlow
published: true
categories: react, redux, ES6, ES2015
---

One of the most common problems that I run into when using Redux is trying to figure out why an action is not being captured by a reducer.  For someone just getting starting with Redux, debugging this issue can be especially overwhelming because of how Redux manages data flow.  So before you start pouring over configuration code, or the logic contained in your action creators and reducers, please, make sure your action types are defined and spelled correctly.


<!--more-->
One of the most common problems that I run into when using Redux is trying to figure out why an action is not being captured by a reducer.  For someone just getting starting with Redux, debugging this issue can be especially overwhelming because of how Redux manages data flow.  So before you start pouring over configuration code, or the logic contained in your action creators and reducers, please, make sure your action types are defined and spelled correctly.

In any application that I have built, most bugs that I have run into are simply due to typos.  However, the solution to this particular problem is harder to spot because no errors are raised when the application is run.  Take a look at the snippet below.

```js
// actionTypes.js

export const FETCH_FILE_REQUEST = 'fetch_file_request';
export const FETCH_FILE_SUCCESS = 'fetch_file_success';
export const FETCH_FILE_FAIL = 'fetch_file_fail';


// filesReducer.js

import {
  FETCH_FILE_REQUEST,
  FETCH_FILE_SUCESS,
  FETCH_FILE_FAIL
} from '../actions/actionTypes';

const filesReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_FILE_SUCESS:
      return { ...state, file: action.payload };
    default:
      return state;
  }
}

export default filesReducer;
```

Assuming we dispatched an action with type FETCH_FILE_SUCCESS, the filesReducer should catch the action before the default case is returned.  But what if that is not happening?  Where do we start the debugging process.  There does not appear to be anything wrong with the code in the reducer; the action type was imported and matches the case in the switch statement.  There are no errors in the browser.  Where is the issue?

You may have noticed that I misspelled SUCCESS in filesReducer.js, but the reason this can be hard to catch is because importing undefined types does not cause an error, so when we import FETCH_FILE_SUCESS, its value is actually undefined, so our reducer always hits the default case.

It would be nice if the existing import/export system could help us catch this.  Unfortunately, since action types are just strings, validating their existence is challenging.  Luckily, we have another option.

#### Enter Proxies

Proxies are a feature of ES2015 that allow us to customize operations on a object.  They can be used in many different ways, and you can find some useful examples [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [here](https://developers.google.com/web/updates/2016/02/es2015-proxies).  For our problem, this example from [Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) looks promising:

```js
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // The default behavior to store the value
    obj[prop] = value;

    // Indicate success
    return true;
  }
};

let person = new Proxy({}, validator);

person.age = 100;
console.log(person.age); // 100
person.age = 'young'; // Throws an exception
person.age = 300; // Throws an exception
```

So if proxies can be used to validate that properties assigned to an object are of a certain type and value, we should definitely be able to ensure that our action types are never undefined, or else throw an error that will be easy for us to fix.  Let’s refactor our actionTypes.js file.

```js
// actionTypes.js

const types = {
  FETCH_FILE_REQUEST: 'fetch_file_request',
  FETCH_FILE_SUCCESS: 'fetch_file_success',
  FETCH_FILE_FAIL: 'fetch_file_fail'
}

const typeValidator = {
  get(obj, prop) {
    if (obj[prop]) {
      return prop;
    } else {
      throw new TypeError(`${prop} is not a valid action type`);
    }
  }
}

module.exports = new Proxy(types, typeValidator);

```

First, we define a object containing all our action types. Then we define our validator handler typeValidator.  The get method inside our handler is called a trap, and provides access to the properties of a object.  If the property we are looking for, an action type, in this case, exists in the types object, return that prop, unmodified.  Otherwise, throw an error because the prop does not exist.

Finally, export a new proxy, passing the types object as the target and the typeValidator as the handler.  However, it is important to note that the ES2015 module system does not work well with proxies, so module.exports and require() must be used for exporting and importing the types.

Barely any code needs to change in the reducer and action creator files, but in order for the action types to be imported successfully, we just need couple lines of code in a new file:

```js
// actionTypesProxy.js

export const {
  FETCH_FILE_REQUEST,
  FETCH_FILE_SUCCESS,
  FETCH_FILE_FAIL,
} = require('./actionTypes');

// in the reducer and action creator files
// change '../actions/actionTypes' to
// '../actions/actionTypesProxy'

```

By creating a proxy to verify the existence of an action type, we no longer have to worry about correctly naming a property upon import because an error will be thrown in the browser console as soon as the application starts.  So, reduce the number headaches you get when developing an application using Redux and start using [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

Interested in learning how to build applications using Redux with ReactJS.  Check out this online course! [Modern React with Redux](https://www.udemy.com/react-redux/)

---
layout: post
title:  "Using and Testing the Facebook API with React and Flux"
excerpt_separator: <!--more-->
author: Suby Raman
date: 2015-12-05 00:30
published: true
categories: react
---

For giving us React and Flux, I've seen relatively little about integrating Facebook's own Graph API with their development tools. The tools are so new that there's precious little instruction out there about how to answer questions that are easier to answer with other architectures, like:

<!--more-->


**Clone the example code:**

```
git clone git@github.com:subyraman/react-flux-facebook-api-example.git
```

**Check out the running example at: http://reactfluxfbapi.herokuapp.com**

For giving us React and Flux, I've seen relatively little about integrating Facebook's own Graph API with their development tools. The tools are so new that there's precious little instruction out there about how to answer questions that are easier to answer with other architectures, like:

- Where do all those asynchronous API calls go?
- How do I send the results of those API calls to the React component? 
- The Facebook API is available as a global object, but how do I test that in a headless Node environment? 

This sample code shows a possible model for integrating the Facebook Graph API with a React app, and provides a test suite that allows us to test these components in isolation.

First, let's take a look at what the Flux architecture typically looks like. 

![Flux architecture](http://i.imgur.com/C3o9SaQ.png)

Though it took me a little while to understand, Flux seems to want us to rock the following model:

- 1) API calls are handled in the Action Creators. When we want new data, a view component calls on an Action Creator.
- 2) We wait for the response from a remote server, then sends the data along with an Action Type (a type of signal) to the Dispatcher.
- 3) The Dispatcher passes the signal and data on to the appropriate Store. 
- 4) The Store, well, stores the data we received. When data is updated, we emit an event.
- 5) This event from the Store is picked up by our view components. Our view components access data from the store, and render it out into beautiful HTML.

The key thing here is that **data flow is unidirectional**. The View Component must not receive data directly from the Action Creator API, it must proceed to the Store (via the dispatcher), and then on to the View. This keeps our data stream organized and all of our components in sync with the data state. 

Let's dig into the code a little bit. I'll show, as an example, how to log in a user to the Facebook API and render out that status.

## The Facebook Login Component ##
The component is simple, as it should be. It should not contain complex logic or data handling. They're meant to be dumb, and treat them that way.

```
import React from 'react';
import FacebookActionCreators from '../actions/FacebookActionCreators';

class FacebookLogin extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <button ref="loginButton" onClick={this.didClickFacebookLoginButton}>Log Into Facebook</button>
        );
    }

    didClickFacebookLoginButton(e) {
        FacebookActionCreators.login()
    }
}

export default FacebookLogin;
```


## The Action Creators ##

For our Action Creators, we want to wrap the API and when we receive a response, we dispatch an `actionType` along with the data. This frees us from having to use promises to return asychronous data; instead we use clearly defined signals that correspond to our action.

This is a simplistic example; we aren't handling error cases, for example. When the user logs into Facebook, it relays the response data to the dispatcher, which contains information about the user's id, the access token, and other information.

```
login: () => {
    window.FB.login((response) => {
        if (response.status === 'connected') {
            FacebookDispatcher.dispatch({
                actionType: Constants.FACEBOOK_LOGGED_IN,
                data: response
            })
        }
    });
},
```

### The Dispatcher

It is nothing special. Flux contains all of the logic within the dispatcher, so it doesn't need any special configuration. Just keep in mind that it is a singleton, and that there is only one instance of it in your app.

```
import {Dispatcher} from 'flux';

const FacebookDispatcher = new Dispatcher();

module.exports = FacebookDispatcher;
```

### The Store

For the store, Flux suggests you extend the `EventEmitter` module, which, as the name suggests, allows us to emit events to components that subscribe to the store. Here are the parts relevant for setting and getting the login data.

```
class FacebookStore extends EventEmitter {
    constructor() {
        super()
        this.facebookAuthData = {};
        ...
    }

    setFacebookAuthData(data) {
        this.facebookAuthData = data;
        this.emitChange();
    }

    get loggedIn() {
        if (!this.facebookAuthData) {
            return;
        }

        return this.facebookAuthData.status == 'connected';
    }

    ...

    emitChange() {
        this.emit(FACEBOOK_CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(FACEBOOK_CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(FACEBOOK_CHANGE_EVENT, callback);
    }
}

// initialize the store as a singleton
const facebookStore = new FacebookStore();
```

React is agnostic to how we want to store our data. We can use Backbone models, simple JS objects, and so on. I am just storing the auth data in a simple object.

ES6 getters allow us to execute logic when a class attribute is accessed. For example, executing `FacebookStore.loggedIn` will check if auth data is available, then test to see if the user is connected to return a boolean.

We include event handlers in our store. After data is set, a change is emitted. Components subscribe to changes, and register callbacks to execute.

**Next, we register the store with our dispatcher**.

```
facebookStore.dispatchToken = FacebookDispatcher.register((action) => {
    ...

    if (action.actionType == Constants.FACEBOOK_LOGGED_IN) {
        facebookStore.setFacebookAuthData(action.data);
    }

    ...
})
```

After registration, the dispatcher will execute the above callback when the Action Creators dispatch an action. Dispatchers can handle more complex behavior, like waiting for another store to be updated before this one; we don't need that here. 

So the dispatcher has sent the store data, the store has updated itself with that data, and the store has emitted an event. What now?

### Rendering out the Login Status

Let's check out the `Main` component, the parent component of this simple example.

```
import React from 'react';

import FacebookActionCreators from '../actions/FacebookActionCreators';
import FacebookStore from '../stores/FacebookStore';
import FacebookLogin from './FacebookLogin';
import FacebookLogout from './FacebookLogout';
...
class Main extends React.Component {
    constructor(props) {
        super();
    }

    getFacebookState() {
        return {
            ...
            loggedIn: FacebookStore.loggedIn,
            ...
        }
    }

    componentDidMount() {
        FacebookActionCreators.initFacebook();
        FacebookStore.addChangeListener(() => this._onFacebookChange());
    }

    componentWillUnmount() {
        FacebookStore.removeChangeListener(this._onFacebookChange);
      }

    _onFacebookChange() {
        this.setState(this.getFacebookState());
    }


    render() {
        return (
            <div>
                {!this.state.loggedIn ? <FacebookLogin /> : null}
                {this.state.loggedIn ? <FacebookLogout /> : null}
                <p>Facebook logged in: {this.state.loggedIn ? 'true' : 'false'}</p>
                ...
            </div>

        );
    }
}

export default Main;
```

So, let's step through a few things happening here:

- When the Component initializes (or 'mounts'), the Facebook API is initialized.
- The Component subscribes to the Store, through the `addChangeListener` method.
- The user clicks the Login button, calling the appropriate Action Creator for data.
- When the Store sends an event signifying a change, the component updates itself with `this.setState(this.getFacebookState())`.
- When `this.setState` is called, the `render` method on itself and all child components are automatically called as well.


# Testing

Testing Flux components with the Facebook API presents some challenges, like:

- The store and dispatcher are singletons. Node caches its modules; how do we deal with that?
- How do we mock the Facebook API?
- How can we test without the overhead of a browser instance or PhantomJS?

### Setup

I am using Mocha+Chai+Sinon. The same general concepts should apply to testing with Jasmine.

First, we set up our fake DOM Check out `setup.js`. Here we ask jsdom to set up our fake DOM for testing in Node. 

```
import { assert } from 'chai';
import { jsdom } from 'jsdom';

global.assert = assert;

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = {userAgent: 'node.js'};
```

**Mocking the Facebook API**

Since the Facebook Graph object is a global object, we have to mock its methods globally. We create a factory for mocking out the Facebook API, in `mock/facebook-api.js`. Every time that FacebookApi.setup() is called, new stubs are attached to the global window which can be monitored.

```
import sinon from 'sinon';

const facebookApi = {
    setup() {
        global.window.FB = {
            login: sinon.stub(),
            logout: sinon.stub(),
            getLoginStatus: sinon.stub(),
            api: sinon.stub()
        }

        return global.window.FB;
    },

    teardown() {
        delete global.window.FB;
    }
}

module.exports = facebookApi;
``` 

**Testing Components**

There are no curveballs here, aside from calling the mock Facebook API for new stubs. We use React's great Test Utilities to render a component into a fake DOM, which we can perform various tests on.

```
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import MockFacebookApi from '../mock/facebook-api';

import FacebookLogin from '../../../src/js/components/FacebookLogin';

describe('login component', () => {
    let facebookLoginComponent;

    beforeEach(() => {
        facebookLoginComponent = TestUtils.renderIntoDocument(
            <FacebookLogin />
        );
        MockFacebookApi.setup()
    })

    afterEach(() => {
        MockFacebookApi.teardown();
    })


    it('should call FB login on click',function() {
        const button = facebookLoginComponent.refs.loginButton;
        TestUtils.Simulate.click(button)

        assert.ok(global.window.FB.login.called)
    })
})
```

**Testing Stores**

This gets trickier.

- The Facebook store is a singleton, it is instantiated once through the app's life.
- Node caches its modules; issuing another `require` will just pull the module from the cache.

 So if we just import it into the test module, we will run into problems; data state will build up in the Store, any stubbed or mocked functions will stay that way. In other words, we need a clean Store for every test; how do we do that? Check out `utils/reload`

 ```
 export default function (module) {
    delete require.cache[require.resolve(module)]
    return require(module)
}
```

We use Node's internal API to delete the module from the cache, and import a new one. This ensures our modules are clean and newly instantiated as we need.

So let's say we want to test that certain actions result in certain behavior from the store. For that, we need to capture the callback that is registered with the dispatcher. Here's a sample:

```
    ...
    describe('dispatcher actions', () => {
        let FacebookStore;
        let FacebookDispatcher;
        let dispatchCallback;

        beforeEach(() => {
            FacebookDispatcher = reload('../../../src/js/dispatcher/FacebookDispatcher')
            sinon.spy(FacebookDispatcher, 'register');   
            FacebookStore = reload('../../../src/js/stores/FacebookStore')
            sinon.spy(FacebookStore, 'emitChange')

            // save the dispatch callback, so action effects on the store can be tested
            dispatchCallback = FacebookDispatcher.register.getCall(0).args[0]
        })

        afterEach(() => {
            FacebookDispatcher.register.restore()
            FacebookStore.emitChange.restore()
        })

        ...

        it('should set facebook data after FB login', () => {
            const actionData = {
                actionType: Constants.FACEBOOK_LOGGED_IN,
                data: 'foo'
            }
            dispatchCallback(actionData)

            assert.equal(FacebookStore.facebookAuthData, 'foo');
            assert.equal(FacebookStore.emitChange.callCount, 1);
        })
        ...
```

Let's step through what's happening here.

- We reload the dispatcher. Remember, the dispatcher is also a singleton, there is one instance in our app. We want a fresh one that is going to be imported into the Store module.
- We spy on the register method of the dispatcher, so we can capture the callback passed to it.
- We reload the store. As the module is initialized, the store registers with the dispatcher and passes a callback to it.
- We capture the callback, and now we can start testing it.


**Testing Action Creators**

Again, we follow a similar pattern with action creators. Since the dispatcher is a singleton, we reload our target modules in order, and test accordingly.

We use Sinon's `callsArgWith` to pass an object to the `FB.login` callback, which results in a dispatch message being sent out.

```
describe('facebook action creators', () => {
    let FacebookDispatcher;
    let FacebookActionCreators;

    beforeEach(() => { 
        FacebookDispatcher = reload('../../../src/js/dispatcher/FacebookDispatcher')
        sinon.stub(FacebookDispatcher, 'dispatch')
        FacebookActionCreators = reload('../../../src/js/actions/FacebookActionCreators')

        MockFacebookApi.setup();
    })

    afterEach(() => {
        MockFacebookApi.teardown();
    })

    ...

    it('should send a dispatch message after FB login connected', () => {
        const fbData = {'status': 'connected'}

        global.window.FB.login.callsArgWith(0, fbData)

        FacebookActionCreators.login()
        assert.ok(FacebookDispatcher.dispatch.calledOnce)

        const [{actionType, data}] = FacebookDispatcher.dispatch.getCall(0).args

        assert.equal(Constants.FACEBOOK_LOGGED_IN, actionType)
        assert.equal(data, fbData)
    })

    ...
```

We run our tests with the following command, which compiles everything, runs our setup file, then our tests:
```
mocha -u tdd -r ./tests/setup --compilers js:babel-core/register ./tests/**/*Test.js
```

That about covers it! If you have any questions, feel free to [tweet them to me](http://twitter.com/subyraman).

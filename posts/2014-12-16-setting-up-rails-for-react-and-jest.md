---
layout: post
title:  "Setting up Rails with React and Jest"
excerpt_separator: <!--more-->
author: James Burnett
date: 2014-12-16 07:43
published: true
categories: react
---
[React](http://facebook.github.io/react/) is Awesome! [Rails](http://rubyonrails.org/) is Awesome! [Jest](https://facebook.github.io/jest/) is awesome! Using Jest with React in Rails should be Awesome Cubed... and yet it seems so difficult. 

<!--more-->

[React](http://facebook.github.io/react/) is Awesome! [Rails](http://rubyonrails.org/) is Awesome! [Jest](https://facebook.github.io/jest/) is awesome! Using Jest with React in Rails should be Awesome Cubed... and yet it seems so difficult. 

Recently, the author was in a position where a legacy project wanted to redesign the front-end while keeping the Rails backend. The project decided to go with a React based redesign phased in, piecemeal, over time. Eventually the old JavaScript would just disappear.

The old JavaScripts had no unit testing, only some integration testing through Cucumber and Selenium. A key requirement of the new front-end was to add unit-testing to the JavaScripts, hopefully getting to a point where the team could practice some [TDD](http://en.wikipedia.org/wiki/Test-driven_development) (despite DHH's proclamation that TDD is dead).

Other guides provided quite a bit of insight on the direction to take. Oliver Lance's [Rails, React, Browserify: Packaging your React components](https://medium.com/@olance/rails-react-browserify-e315001d5974) article was especially useful. However, it did not address testing. Integration tests were possible using Oliver's setup, but Jest was unusable.

This article seeks to provide a decent setup for using React in Rails, with all Node packages, Jest test functionality, and react_ujs Rails helpers. We accomplish this using two sweet gems, [react-rails](https://github.com/reactjs/react-rails) and [browserify-rails](https://github.com/browserify-rails/browserify-rails), and a little bit of glue.

_All of the code used in this article is available on [GitHub](https://github.com/HurricaneJames/rex)._

# Basic Rails Setup

We assume a working knowledge of [Rails](http://rubyonrails.org/). However, as a simple scaffolding upon which to build, we will be using the following setup.

1.  `rails new rex -T`

2.  Remove Turbolinks _(technically optional)_

    -   from the `Gemfile`

        ~~~
            # Gemfile
            source 'https://rubygems.org'

            gem 'rails', '4.1.8'
            gem 'sqlite3'

            gem 'sass-rails', '~> 4.0.3'
            gem 'coffee-rails', '~> 4.0.0'
            gem 'uglifier', '>= 1.3.0'
            gem 'therubyracer',  platforms: :ruby

            gem 'jquery-rails'
            gem 'jbuilder', '~> 2.0'
            gem 'spring',        group: :development
            gem 'thin'
        ~~~

    -   from `application.js`

        ~~~
            // app/assets/javascripts/application.js
            //= require jquery
            //= require jquery_ujs
            //= require_tree .
        ~~~

3.  `cd rex; bundle install`

4.  `rails generate controller pages index --no-helper --no-assets --no-controller-specs --no-view-specs`

5.  Update Rails routes root to new `pages#index`.

    ~~~
    # config/routes.rb
    Rails.application.routes.draw do
      get 'pages/index'
      root to: 'pages#index'
    end
    ~~~

# Add in React-Rails

The best part of [React-Rails](https://github.com/reactjs/react-rails) is the React UJS and the view helpers. However, the stable versions of react-rails only contain react.js. Hopefully the react-rails project will correct this shortcoming in the future as react_ujs is the most valuable part of the gem. In the meantime, use the 1.0.0.pre branch directly from [GitHub](https://github.com/).

1.  Add 'react-rails' to the Gemfile.

    ~~~
    echo "gem 'react-rails', '~> 1.0.0.pre', github: 'reactjs/react-rails'" >> Gemfile
    ~~~

2.  `bundle install`

3.  Add react-rails to the application config.

    ~~~js
    # config/application.rb
    config.react.variant      = :production
    config.react.addons       = true
    ~~~

4.  Setup react-rails for development mode.

    ~~~js
    # config/environments/development.rb
    config.react.variant = :development
    ~~~

5.  Add React to application by adding react via two sprocket includes `//= require react` and `//= require react_ujs`. This will change in the next section, but only slightly.

    -   First, create a new `components.js` file which will include all of our React components.

        ~~~
          // app/assets/javascripts/components.js
          //= require react
          //= require react_ujs
        ~~~

    -   Then update `application.js` by removing the `require_tree` directive and including the new `components.js` code.

        ~~~
          // app/assets/javascripts/application.js
          //= require jquery
          //= require jquery_ujs
          //= require components
        ~~~

At this point it is possible to create React components by placing them in the `components.js` file and calling them with `react_component 'ComponentName', {props}`. in the Rails views. However, there are some limitations. First, it cannot make use of Jest for testing, though Jasmine and full integration tests should work. Second, it is not possible to `require()` any node packages. For example, many React applications will want to include node packages like the [es6-promise](https://www.npmjs.com/package/es6-promise) or [reflux](https://www.npmjs.com/package/reflux) packages.

# Browserify-Rails

The general solution for adding CommonJS and `require()` for React is to use a package like [browserify](http://browserify.org/). Fortunately, there's a gem for that: [browserify-rails](https://github.com/browserify-rails/browserify-rails). Installation is fairly straight forward.

1.  Verify that [Node](http://nodejs.org/) is installed.

2.  Add browserify-rails to the gemfile.

    ~~~
    echo "gem 'browserify-rails', '~>0.5'" >> Gemfile
    ~~~

3.  `bundle install`

4.  Create a package.json file.

    ~~~
    {
      "name": "rex-app",
      "devDependencies": {
        "browserify": "~>6.3",
        "browserify-incremental": "^1.4.0",
        "reactify": "^0.17.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    }
    ~~~

    **Important!** Any package that needs to be `require()`d should be added to the devDependencies of `package.json`.

    **Update:** 2015-02-11
    The browserify-rails was updated to use browserify-incremental. This means we need to add 'browserify-incremental' to your package.json. Trying to use browserify-rails without browserify-incremental will appear to work fine, but will throw an exception when making changes to JavaScript files and refreshing the page. Please add the following to your package.json file to work with browserify-rails 0.7.2 and above.

    ~~~
        "browserify-incremental": "^1.4.0"
    ~~~

5.  `npm install`

    -   Note: add `/node_modules` to the `.gitignore` file if git is being used.

6.  Enable converstion of JSX to JS by adding the following param to `config/application.rb`

    ~~~
    config.browserify_rails.commandline_options = "--transform reactify --extension=\".jsx\""
    ~~~

7.  Create a `components/` directory in `app/assets/javascripts/`. All React components will go in this directory.

8.  Add components.

    ~~~js
    //app/assets/javascripts/components/DemoComponent.jsx
    var DemoComponent = React.createClass({displayName: 'Demo Component',
      render: function() {
        return <div>Demo Component</div>;
      }
    });

    // each file will export exactly one component
    module.exports = DemoComponent;
    ~~~

9.  Update `components.js` to link required modules from the components directory.

    ~~~
    // note that this is a global assignment, it will be discussed further below
    DemoComponent = require('./components/DemoComponent');
    ~~~

10. Add the demo component into our view.

    ~~~
    <h1>/app/views/pages/index.html.erb</h1>
    <%= react_component 'DemoComponent', {} %>
    ~~~

This setup gives us `require()`. However, there are some things to note. First, do not `require('react')` via CommonJS `require()`. React is being loaded globaly by react-rails via the sprocket `//= require react` directive. A second inclusion will cause React to throw errors. Second, each and every single component that should be available globally needs to be `require()`d in `components.js`. CommonJS does not have an equivalent to the sprocket `//= require_tree` directive.

# Fixing Browserify/React-Rails

Problem, `require('react')` is necessary if we want to use Jest. The solution so far provides `require()` for other libraries, but not `require('react')`. So, how to get this crucial last requirement. Presently, the only workable solution is to ignore the `react.js` asset provided by react-rails and use the Node version instead.

1.  Replace `//= require react` with `require('react')` in `component.js`

    ~~~
    //app/assets/javascripts/components.js
    //= require_self
    //= require react_ujs

    React = require('react');

    // put components here
    DemoComponent = require('./components/DemoComponent');
    ~~~

    `//= require_self` is called before `//= require react_ujs`. This allows `react.js` to be loaded from node modules instead of react-rails.

2.  Update `package.json` with the following in `devDependencies`:

    ~~~
    "react": "^0.12.0",
    "react-tools": "^0.12.1"
    ~~~

3.  Run `npm install` again.

4.  Add `var React = require('react');` to your top of each of your components. For example:

    ~~~js
    //app/assets/javascripts/components/DemoComponent.jsx
    var React = require('react');

    var DemoComponent = React.createClass({displayName: 'Demo Component',
      render: function() {
        return <div>Demo Component</div>;
      }
    });

    module.exports = DemoComponent;
    ~~~

Now we can `require('react')`, export the component via `module.exports`, and inject components with `react_component` Rails view helpers.

# Jest

We can finally get going with [Jest](https://facebook.github.io/jest/). Jest is based on Jasmine and used by Facebook to test React. It automatically mocks out all modules except those being tested, it can run tests in parallel, and it runs in a fake DOM implementation. Bottom line, Jest is awesome.

However, Jest really wants a CommonJS structure where everything is included via `require()`. That is why we had to go through all the trouble in the previous sections. Fortunately, now that the hard work is done, making Jest work is relatively easy. It requires updating `package.json`, creating a new directory, and adding a couple of script files.

1.  Create a directory for the tests in `app/assets/javascripts/components/__tests__`.

    Note that Rails generally puts tests in a `test/` or `spec/` directory. However, it is easier to put Jest tests in a `__tests__` directory under the actual components. Otherwise, the test `require()` statements end up with lots of brittle, ugly `../../../app/assets/javascripts/components/[component]`s.

    Placing the tests here has one slight complication though. Sprocket's `//= require_tree` will include the tests as part of the build. This should not be an issue as the `components/` directory should not be part of any `//= require_tree` directive anyway, as that also would break the CommonJS structure we use.

2.  Create a file `app/assets/components/javascripts/__tests__/preprocessor.js` to convert any JSX to JS (remember that browserify-rails does this via reactify when running via Rails).

    ~~~js
    //app/assets/javascripts/components/__tests__/preprocessor.js
    var ReactTools = require('react-tools');

    module.exports = {
      process: function(src) {
        return ReactTools.transform(src);
      }
    };
    ~~~

3.  Add and configure Jest in the `package.json`


~~~
    "devDependencies": {
      "jest-cli": "^0.5.4",
    },
    "scripts": {
      "test": "node ./node_modules/jest-cli/bin/jest.js"
    },
    "jest": {
      "rootDir": "./app/assets/javascripts/components",
      "scriptPreprocessor": "<rootDir>/__tests__/preprocessor.js",
      "moduleFileExtensions": [ "js", "jsx"],
      "unmockedModulePathPatterns": [
        "react"
      ],
      "testFileExtensions": ["js", "jsx"],
      "testPathIgnorePatterns": [ "preprocessor.js" ]
    }

* `rootDir` points to the components directory (Jest will automatically load the __tests__ path by default).
* `scriptPreprocessor` points to our JSX preprocessor script.
* `umockedModulePathPatterns` tells Jest not to mock out React, which we need for our components to work.
* `testPathIgnorePatterns` tells Jest to ignore our JSX preprocessor. Placing `preprocessor.js` in a different directory would eliminate the need for this directive. However, this feels cleaner.
~~~

  **Update:** 2015-09-21
  The original version of this post used `"jest-cli": "^0.2.0"`, which [began producing errors](https://github.com/facebook/jest/issues/378) with certain versions of Node. The version has been updated to `"jest-cli": "^0.5.4",` which solves that issue. However due a decision by the JSDOM package to support io.js rather than node when they were separated, this requires version using Node v4.0.0 or higher. When it comed to Jest, your options are:
  
  * Jest 0.4 with Node 0.10
  * Jest 0.5 with io.js 2+ or Node v4.0+
  * In the future it will be Jest 0.6+ with Node 4.0+ only.
  
  You can read more about this in [this github issue](https://github.com/facebook/jest/issues/243).

4.  `npm install`

5.  Create a test for our demo component.

~~~js
    // app/assets/javascripts/components/__tests__/DemoComponent-test.jsx
    jest.dontMock('../DemoComponent');

    describe('DemoComponent', function() {
      it('should tell use it is a demo component', function() {
        var React = require('react/addons');
        var TestUtils = React.addons.TestUtils;
        var DemoComponent = require('../DemoComponent');
        var demoComponent = TestUtils.renderIntoDocument(<DemoComponent/>);
            expect(demoComponent.getDOMNode().textContent).toBe('Demo Component');
      });
    });
~~~

5.  Run tests with `npm test`.

Now it is possible to run Jest based tests, `require()` CommonJS packages, and inject React via Rails views.

# Gotchas with jQuery and other Gem-based Assets

The basic Rails application uses the `jquery-rails` gem. `jquery-rails` has the same problem with `require('jquery')` that `react-rails` has with `require('react')`. This will be a problem with any application that adds assets via gems and tries to use both `//= require` and `require()` for that asset. Fortunately, jQuery is resilient to multiple includes, so the only real concern is bloat.

The maintainers of `browserify-rails` know about the [problem](https://github.com/browserify-rails/browserify-rails/issues/9). Hopefully, a solution is implemented soon. In the mean time, one potential solution is to remove the `jquery-rails` gem, `//= require jquery` and `//= require jquery_ujs`. Another solution, if your project needs these gems, is to add jQuery to `application.js` the way react.js is added to `components.js`.

~~~
//= require_self
//= require jquery_ujs
//= components

$ = jQuery = require('jquery');
~~~

Then add jQuery to the devDependencies of `package.json`. _(Remember that all `require()`d packages must be in package.json and `npm install`ed)_.

~~~
"devDependencies": {
    "jquery": "^2.1.1"
}
~~~

# Conclusion

We have setup Rails to work with React, Node packages, and Jest. To use this setup, simply add React components to the `app/assets/javascript/components/` directory and put any global components that the `react_component` view helper might need in `app/assets/javascripts/components.js`. Tests are simple Jest tests in the `app/assets/javascripts/components/__tests/` directory. Rspec/Cucumber integration tests should work as expected too.

Hopefully, this article has been useful to help setup a foundation for using React and Jest in your Rails application.

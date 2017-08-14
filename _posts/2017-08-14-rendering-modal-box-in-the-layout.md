---
layout: post
title:  "Rendering Modal Box in the Layout"
date:   2017-08-14 12:00
excerpt_separator: <!--more-->
author: Zack Siri
published: true
categories: react, es6, component, singleton, mobx
---

When building react applications we generally need to use modal boxes in our application, however it's not always clear how we render the modal box. Should we render it in the page? or render it once in our layout and re-use it? This is a companion post for a [video episode on youtube](https://www.youtube.com/watch?v=j5Kjtme9BNw&index=35&list=PLjQo0sojbbxU6Yl9l-38gOyeQYjqXefq7)

<!--more-->
When building react applications we generally need to use modal boxes in our application, however it's not always clear how we render the modal box. Should we render it in the page? or render it once in our layout and re-use it? This is a companion post for a [video episode on youtube](https://www.youtube.com/watch?v=j5Kjtme9BNw&index=35&list=PLjQo0sojbbxU6Yl9l-38gOyeQYjqXefq7)

Modal boxes are what I consider 'singletons' which means only 1 instance should be rendered at any time. There should not be many instances of it on the page, however if we render it locally in our component we could have mulitple modal boxes overlapping each other if they're not well managed. We eliminate this problem by rendering only 1 instance of the modal box and sharing it across multiple pages of our application.

We start off by defining an observable like so.

``` js
// in settings.js
import { observable } from 'mobx';

const layout = observable({
  modal: null,
});

export default { layout };
```

We can then import the settings file and use it in our application via the provider.

``` js
// app index.js

//...

import settings from './settings';

render(
  <Provider {...stores} settings={settings}>
  {/* render app */}
  </Provider>
);
```

Then in our shared layout or main `Application` component we just use `@inject` to make the settings available in our layout component like so.

``` js
@inject('settings') @observer
class Application extends React.PureComponent {
  // ...
  setModal = (node) => {
    const { settings } = this.props;
    settings.layout.modal = node;
  }

  render() {
    return (
      // ...
      <Modal ref={this.setModal} />
    );
  }
}
```

Once we render the `Modal` component we use the `ref` callback to set the modal node to the settings state we injected into the component.

Now whenever we need to use the modal all we have to do is `@inject('settings')` in the component and we will have access to the modal node via the props.

Whenever we need to access the modal we can simply de-structure the `props` like so.

```js
  someFunction = (args) => {
    const { modal } = this.props.settings.layout;
    modal.setContent();
    modal.open();
  }
```

This pattern is a much cleaner way to render components that need to be shared. We're using mobx's observable to set the reference to the node and then we can access it across components very easily.

This is just one of the many episodes we have in the React Foundation series, have a look at our [playlist here on youtube](https://www.youtube.com/playlist?list=PLjQo0sojbbxU6Yl9l-38gOyeQYjqXefq7)
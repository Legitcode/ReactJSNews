---
layout: post
title:  "Modals in React"
excerpt_separator: <!--more-->
author: Zach Silveira
date: 2015-07-29 00:35
published: true
categories: react, modal
---

Have you wanted to use some type of modal in React but didn't know where to start?
I'll be going over a few community-built components that help you create modals.


There's been a few times I've needed a modal in the app I'm building. Thankfully the community has made a few really good components for this.
Let's jump right in to the first:

###Elemental UI's modal

You can check out a demo of it right [here](http://elemental-ui.com/modal). The markup is straight forward:

~~~js
<Modal isOpen={this.state.modalIsOpen} onCancel={this.toggleModal} backdropClosesModal>
  <ModalHeader text="Live Demo" showCloseButton onClose={this.toggleModal} />
  <form action="#" onSubmit={this.submitForm} noValidate>
    <ModalBody>
      <FormField label="Email">
        <FormInput label="Email" type="email" name="email" ref="email" value={this.state.email} onChange={updateInput} required />
      </FormField>
    </ModalBody>
    <ModalFooter>
      {submitButton}
      <Button onClick={this.toggleModal} type="link-cancel" disabled={this.state.formProcessing}>Cancel</Button>
    </ModalFooter>
  </form>
</Modal>
~~~

You can place things in the header or footer just as easily as the body which is nice. I also like the look of it, and Elemental UI as a whole.
My biggest gripe about this modal component is that on scrolling the page it disappears.

###React Bootstrap

This is probably one that everyone has heard of, as it is one of the oldest React projects. You can find documentation [here](http://react-bootstrap.github.io/components.html#modals). It consists of a couple sub components for the header and footer as well.
The root `modal` component expects two props, a boolean called `show`, and a function to be called `onHide`.

~~~js
<Modal show={this.state.showModal} onHide={this.close}>
  <Modal.Header closeButton>
    <Modal.Title>Modal heading</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <h4>Text in a modal</h4>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={this.close}>Close</Button>
  </Modal.Footer>
</Modal>
~~~

The `close` and `show` functions are flipping the state:

~~~js
close(){
  this.setState({ showModal: false });
}
~~~

###Rackt's Modal

Rackt's modal is much simpler than the other two, as seen on the [github page](https://github.com/rackt/react-modal).

It doesn't have any sub components. It accepts `isOpen` (bool) and `onRequestClose` (function) as props:

~~~js

<Modal isOpen={bool} onRequestClose={fn} closeTimeoutMS={n}>
  <h1>Modal Content</h1>
  <p>Etc.</p>
</Modal>
~~~

Those are the top three modal components out there. At my work, we use popovers a lot. My coworker made his own component called [reactable-popover](https://github.com/dphaener/reactable-popover) that has been really useful for me. Sadly he's always too busy to document anything, so I'll throw in a little example here.

~~~js
<Popover
  className=''
  toggleButton={button}
  handleClick={this.togglePopover}
  position='left'
  isOpen={true}
  topOffset={10}
  leftOffset={10}>
  <div>
    content
  </div>
</Popover>

~~~

The props are very self explanatory, except for toggleButton. It expects a component or some jsx to be passed into it.

###Boron Modal

[Boron](http://madscript.com/boron/) comes out of the box with some animations.

~~~js
var Modal = require('boron/DropModal');
var Example = React.createClass({
  showModal: function(){
    this.refs.modal.show();
  },
  hideModal: function(){
    this.refs.modal.hide();
  },
  render: function() {
    return (
      <button onClick={this.showModal}>Open</button>
      <Modal ref="modal">
        <h2>I am a dialog</h2>
        <button onClick={this.hideModal}>Close</button>
      </Modal>
    );
  }
});
~~~

The author suggests placing a ref on the modal. Then you can open and close it via `this.refs.modal.show()` and `this.refs.modal.hide()`.

### React Modal Dialog

[React modal dialog](http://www.qimingweng.com/react-modal-dialog) is an idiomatic way to show dialogs. You simply render the dialog component in when you want to show one, and don't render it when you don't. This is achieved through through a 'portal'.

~~~js
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

// In a render function:
class Button extends React.Component {
  state = {
    isShowingDialog: false
  }
  render() {
    return (
      <a className="button">
				<span>Button Text</span>

      	{this.state.isShowingDialog ?
          <ModalContainer onClose={...}>
            <ModalDialog onClose={...}>
            <h1>Dialog Content</h1>
            <p>More Content. Anything goes here</p>
            </ModalDialog>
          </ModalContainer>
        : null}
      </a>
    )
  }
}
~~~

### React Modal Dialog

[React modal dialog](http://www.qimingweng.com/react-modal-dialog) is an idiomatic way to show dialogs. You simply render the dialog component in when you want to show one, and don't render it when you don't. This is achieved through through a 'portal'.

~~~js
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

// In a render function:
class Button extends React.Component {
  state = {
    isShowingDialog: false
  }
  render() {
    return (
      <a className="button">
				<span>Button Text</span>

      	{this.state.isShowingDialog ?
          <ModalContainer onClose={...}>
            <ModalDialog onClose={...}>
            <h1>Dialog Content</h1>
            <p>More Content. Anything goes here</p>
            </ModalDialog>
          </ModalContainer>
        : null}
      </a>
    )
  }
}
~~~

Thanks for checking out the post, don't forget to follow [@ReactJSNews](http://twitter.com/reactjsnews) for more content! Leave a comment if you have any suggestions. As always, you're welcome to modify this post (or write your own!) by sending in a pull request on [github](http://github.com/legitcode/reactjsnews)!

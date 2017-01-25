I’ve been experimenting with Auth0 and Firebase in the last couple of weeks and I’m writing this tutorial to support other Engineer who want to use the same technologies for their Login/Database.

**Expected Result:**
We are building a Login Button that opens an Auth0 Lock. After that, the generated Login token will be used to save some data to a firebase database.

**Before you start:**
Integrate Auth0 to your React Native project (as mentioned here)
Integrate Firebase to your React Native project (as mentioned here)

**Start with a simple Login Button**

    var LoginButton = React.createClass({
      _login: function() {
        // to be implemented later
      },

      render: function() {
        return (
          <Button
            style={styles.button}
            onPress={this._login}>
            Login
          </Button>
        );
      },
    )};

    var styles = StyleSheet.create({
      button: {
        // your styles goes here
        color: 'white',
      },
    });

    module.exports = LoginButton;


**Suggested: Save your firebase and Auth0 credentials in an extra file (and gitignore that)**

    // LoginButton.js
    var cred = require('./ignore/credentials.js');
    var ref = _getFireBaseRef();


    // credentials.js (example)
    window._getFirebaseRef = function() {
      return "https://myfirebase.firebaseio.com/";
    };

**Import other Firebase and Auth0 references**

    // LoginButton.js

    var Auth0Lock = require('react-native-lock-ios');
    var Firebase = require('firebase');

    // your firebase reference (from credentials.js)
    var ref = new Firebase(_getFirebaseRef());

    // your custom Auth0 Lock
    var lock = new Auth0Lock({
      clientId: _getAuth0ClientID(),
      domain: _getAuth0Domain(),
    });

**Update your security rules on firebase.**
This is important if you don’t want other users to read or write data that doesn’t belong to them.

    {
      "rules": {
         "users": {
          "$userid": {
            ".read": "auth.uid == $userid",
            ".write": "auth.uid == $userid",
          }
        }
      }
    }

**Import the firebase token generator (you need this to save user referenced data to your firebase database)**

    var FirebaseTokenGenerator = require("firebase-token-generator");


 **Let’s change the Login function...**

    _login: function() {
      // show the lock
      lock.show({}, (err, profile, token) => {
        if (err) {
          console.log(err);
        }

        // firebase token: Firebase app configuration -> secrets
        var tokenGenerator = new FirebaseTokenGenerator(_getFirebaseToken());

        // use the token generator to create a new token with the userId
        var ref_token = tokenGenerator.createToken({ uid: profile.userId });

        ref.authWithCustomToken(ref_token, function(error, authData) {
          if (error) {
            console.log('Login Failed!');
          } else {
            console.log('Login Successful!');

            // now use your firebase reference to save some data for the user!
            var firebase_user_ref = ref.child('users').child(authData.uid);
            firebase_user_ref.push({
              "text": "I'm logged in!",
              "date": new Date().getTime(),
            });
          }
        });
      },
    },

**SUGGESTED: Encrypt your data!**
Firebase does not have a mode to encrypt your data automatically, so it will save the plain text on firebase (but it’s using https for transmitting the data). That means: all your administrators will be able to see the data.

Solution: JavaScript libraries to encrypt the data (e.g. https://code.google.com/p/crypto-js/)

Now you’re all set to write your first app with Auth0 authentication and Firebase storage!


-- Maria Hollweck

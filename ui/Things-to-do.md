Header.js:
1. Does it render the things that it should - test that out (especillay with backend integration)
2. Test the login popup

Home.js
1. Are we doing upcoming events? If we are then implement it on the frontend.
2. We should sort the favorited events by start date and time and have the 4 earliest ones displayed on the home page.

Org.js and Event.js (common stuff):
1. How to know if some user is a club admin so that we can decide which buttons to display? Also, we will only need to display the org specific buttons (edit, delete) for the org that the user is a club admin of - can't display those buttons for all orgs when user is club admin.
2. What to do on the frontend for favoriting and deleting an org/event?
3. How to handle the case of a club admin adding a new org or adding a new event? Will we need a new component or somehow integrate it using the edit “components”?
4. What to do for the org and event images? Right now both are auto-generated but we could change that if we want.

Event.js:
1. Location is not a field in the database - we need to have that.

Edit pages:
1. Need to send new state to the backend api when submitting the form
2. Do we need a cancel button and if so, what do we do inside that event handler?

Search.js
1. Bugs that need to be fixed - don't know whether it's the backend or the frontend.

Settings.js:
1. Again, only display the 4 earliest favorited events.
2. Should we even display the orgs? If we do, then we should only display a limited number of them.
3. Might have to remove the change button if we don't have functionality to change email.

General stuff:
1. Should change how date and time is displayed - should be displayed separately. Because it doesn't look good right now.
2. Do some form validation for all the inputs. Not sure if we need this for any form though.
3. Modify all the state updates to use this.setState function.
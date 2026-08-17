# పల్లెటూరు భోజనం — starter website

## GitHub upload
Upload all files in this folder to the root of your GitHub repository.

## Firebase
1. In Firebase Console, open Project settings → Your apps → Web app.
2. Copy the Firebase config into `firebase-config.js`.
3. Authentication → Sign-in method → Email/Password → Enabled.
4. Create Firestore Database.
5. Firestore Rules → paste the contents of `firestore.rules` and publish.
6. Create your admin user in Authentication → Users → Add user.

## Important
This starter is ready for the website structure, customer ordering, menu editing and admin login. Before public launch, tighten Firestore rules so only your admin account can write the menu/read orders.

## Firebase Hosting
After installing Firebase CLI on a computer:
`firebase login`
`firebase init hosting`
`firebase deploy`

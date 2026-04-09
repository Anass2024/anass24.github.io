# Firebase Setup

This app is now structured as a static SaaS-style frontend for Firebase Authentication + Cloud Firestore.

## 1. Create Firebase project

Follow the official setup flow:
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/firestore/quickstart

## 2. Enable products

In Firebase Console:
- Enable `Authentication`
- Enable `Email/Password`
- Create a `Cloud Firestore` database

## 3. Add your web app config

Edit:
- `finance-tracker/js/firebase-config.js`

Replace the placeholder values with your Firebase web app configuration.

## 4. Firestore security rules

Apply the rules from:
- `finance-tracker/firebase.rules`

These rules ensure users can only access their own data.

## 5. Data model

Collections used by the app:
- `users/{uid}/transactions/{transactionId}`
- `users/{uid}/settings/profile`

Transaction fields:
- `userId`
- `title`
- `amount`
- `type`
- `category`
- `date`
- `recurring`
- `createdAt`

Settings fields:
- `userId`
- `budget`
- `updatedAt`

## 6. Hosting

This frontend works as a static site and can be deployed on:
- GitHub Pages
- Vercel
- Firebase Hosting

If you want the easiest production path with Firebase, the official hosting docs are:
- https://firebase.google.com/docs/hosting

## 7. Real-time sync

The app uses Firestore `onSnapshot()` listeners so:
- transactions update instantly
- settings update instantly
- users see the same data across devices after login

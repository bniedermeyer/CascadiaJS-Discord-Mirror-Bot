<p align="center" >
  <img src="cjs-logo.png" alt="CascadiaJS Logo" width="200" />
</p>  

# CascadiaJS Discord Bot 
This is a bot built to scrape all messages from a Discord channel and store them in a Firebase Realtime Database. 

## Getting Started
This bot is built on [Abbot](https://ab.bot/), so the first step is to familiarize yourself with this platform and [setup your local development environment](https://blog.ab.bot/archive/2021/08/31/abbot-cli/) 

After you have authenticated with Abbot you will be able to run the skill locally via `npm test`. 

To make changes to the bot logic, edit `cascadia-js-live-sync/main.js`.

### :bangbang: A note about authentication  
It is highly recommended that you enable authentication on the read and write permissions of your Realtime Database. There are multiple ways to [authenticate](https://firebase.google.com/docs/auth) requests with Firebase. We chose the approach of exposing a cloud function that authenticates via the [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup). If you take this approach we also suggest securing any Firebase Function endpoints. For convienience we've created a script that will generate a [JWT](https://jwt.io/introduction) for you to use.


After you have secured your requests to Firebase, you can enable auth in your database by adding the following to the `rules` object in the database `Rules` page: 
```
".write": "auth != null"
```

## Deployment  
When you want to deploy updates to the script to Abbot, simply execute the deployment npm script `npm run deploy`. Make sure you are already authenticated to an Abbot workspace before running the command. 

To deploy changes to the Firebase Function, first Authenticate with the firebase CLI, then run `npm run deploy:firebase`.
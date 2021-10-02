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
It is highly recommended that you enable authentication on the read and write permissions of your Realtime Database. For convienience, a script is included to [generate an access token](https://firebase.google.com/docs/database/rest/auth#generate_an_access_token). All you need to do to generate the token is save your project's Service Account token from Firebase as `firebase-sa-key.json` in the  `scripts/keys` directory and run `npm run generate:token`. The token will be logged to the console for you to copy and add to your `firebase-url` secret in Abbot. The token should be appended to the end of your URLs like so: 
```
https://<DATABASE_NAME>.firebaseio.com/users/ada/name.json?access_token=<ACCESS_TOKEN>
```
Afterwards, you can enable auth in your database by adding the following to the `rules` object in the database `Rules` page: 
```
".write": "auth != null"
```

## Deployment  
When you want to deploy updates to the script to Abbot, simply execute the deployment npm script `npm run deploy`. Make sure you are already authenticated to an Abbot workspace before running the command. 
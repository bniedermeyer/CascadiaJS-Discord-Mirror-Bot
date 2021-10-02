﻿  const fetch = require('node-fetch');
  const FIREBASE_URL = await bot.secrets.read('firebase-url')
  
  const body = {
    // this `visible` field is utilized to remove messages from the stream while preserving the data
    // e.g. if someone posts something inappropriate toggling this value in the db will remove it from view
    visible: true,
    text: bot.arguments,
    username: bot.from.name,
    email: bot.from.email,
    created: new Date().toISOString()
  }
  
  try {
    await fetch(FIREBASE_URL, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    })
  } catch(err){
    console.error('Error updating datastore: ',err)
  }

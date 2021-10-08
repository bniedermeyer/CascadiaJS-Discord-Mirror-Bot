if (bot.room.name === 'discord-widget-test') {

  const fetch = require('node-fetch');
  const FIREBASE_URL = await bot.secrets.read('url-firebase');
  const FIREBASE_TOKEN = await bot.secrets.read('token-firebase');
  const body = {
    // this `visible` field is utilized to remove messages from the stream while preserving the data. e.g. if someone posts something inappropriate toggling this value in the db will remove it from view
    visible: true,
    text: bot.arguments,
    username: bot.from.name,
    email: bot.from.email,
    created: new Date().toISOString(),
  };
  
  
    await fetch(FIREBASE_URL, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", "authorization": `Bearer ${FIREBASE_TOKEN}` }
    });
}



import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { verify } from 'jsonwebtoken';
import { fetchGifInfo } from './gifs'

admin.initializeApp(functions.config().firebase)

export const postMessage = functions.https.onRequest(async (request, response) => {
    const { body, headers } = request;
    const { email, ...message } = body;
    const { authorization: authHeader } = headers;
    const token = (authHeader as string).split(' ')[1];

    if (verify(token, functions.config().abbot.key)) {
        let gif;
        if (message.text.match(/^https:\/\/tenor.com\/view\/.*\d+$/)) {
            gif = await fetchGifInfo(message.text, true)
            
        } else if (message.text.match(/\.gif$/)) {
            gif = await fetchGifInfo(message.text, false);
        }
        if (gif) {
                message.gif = gif;
        }
        // note: by default we will receive service account auth since it's in the same project as the db
        // this allows us to write to the db without needing a specific rule
        const db = admin.database();
        const logRef = db.ref('messageLog');
        const ref = db.ref('messages');
        const newMessageRef = ref.push()
        // save the message to firebase
        newMessageRef.set(message)
        // store email sender for each message in case of CoC issues
        // table will be deleted after conference.
        const messageId = newMessageRef.key;
        logRef.push().set({ messageId, email });
    } else {
        response.statusCode = 401;
    }

    response.send("ok");
});


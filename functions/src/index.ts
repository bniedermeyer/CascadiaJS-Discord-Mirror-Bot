import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import {verify} from 'jsonwebtoken';

admin.initializeApp(functions.config().firebase)

export const postMessage = functions.https.onRequest((request, response) => {
    const { body: message, headers } = request;
    const { authorization: authHeader } = headers;
    const token = (authHeader as string).split(' ')[1];

    if (verify(token, functions.config().abbot.key)) {
        const db = admin.database();
        const ref = db.ref('messages');
        ref.push().set(message)
    } else {
        response.statusCode = 401;
    }

    response.send("ok");
});

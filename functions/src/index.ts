import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { verify } from 'jsonwebtoken';
import { fetchGifInfo } from './gifs'
// const cors = require('cors')({ origin: [/2021\.cascadiajs\.com$/, /localhost:3333$/] });

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

// export const postQuestion = functions.https.onRequest((request, response) => {
//     cors(request, response, () => {
//         const { body, headers } = request;
//         const { origin } = headers;
//         if (!origin || !origin.match(/(2021\.cascadiajs\.com$|localhost)/)) {
//             response.send(400)
//         } else {
//             const question = { ...body, count: 1, upvotedBy: [body.userId] }
//             const db = admin.database();
//             const ref = db.ref(`questions/${body.correlationId}`);
//             const pushRef = ref.push(question);
//             const { key } = pushRef;
//             ref.child(key!).update({key})
//             response.send(key) 
//         }
//     })
// });

// export const incrementQuestion = functions.https.onRequest((request, response) => {
//     cors(request, response, () => {
//         console.log('starting function')
//         functions.logger.log('test logging')

//         const { body, headers } = request;
//         const { origin } = headers;
//         if (!origin || !origin.match(/(2021\.cascadiajs\.com$|localhost)/)) {
//             response.send(400)
//         } else {
//             // functions.logger.log('body: ', body)
//             const {key, correlationId} = body
//             const db = admin.database();
//             const ref = db.ref(`questions/${correlationId}/${key}`);
//             ref.transaction((currentVal) => {
//                 functions.logger.log('current', JSON.stringify(currentVal));
//                 if (currentVal) {
//                     if (currentVal.upvotedBy.includes(body.userId)) {
//                         functions.logger.log('user already voted')
//                         // user already upvoted. Abort update
//                         return undefined;
//                     }
                    
//                     const updatedVal = { ...currentVal, count: currentVal.count + 1, upvotedBy: [...currentVal.upvotedBy, body.userId] }
//                     functions.logger.log('updated val', JSON.stringify(updatedVal));
//                     return updatedVal
//                 } else {
//                     return null
//                 }
//             }, (error, committed, snapshot)  => {
//                 if (error) {
//                     functions.logger.log('Transaction failed abnormally!', error);
//                 } else if (!committed) {
//                     functions.logger.log('We aborted the transaction.');
//                 } else {
//                     functions.logger.log('question incremented');
//                 }
//                 if (snapshot) {
//                   functions.logger.log("Question: ", snapshot.val());
//                 }
//             });
//             response.send('ok') 
//         }
//     })
// });

export const incrementQuestion = functions.https.onCall(async (data, context) => {
    const { key, correlationId, userId } = data
    const validUser = await verifyUser(context.auth!.uid, userId)
    if (!validUser) {
        throw new functions.https.HttpsError('failed-precondition', 'increment failed')
    }
    const db = admin.database();
    const ref = db.ref(`questions/${correlationId}/${key}`);
    ref.transaction((currentVal) => {
        functions.logger.log('current', JSON.stringify(currentVal));
        if (currentVal) {
            if (currentVal.upvotedBy.includes(userId)) {
                functions.logger.log('user already voted')
                // user already upvoted. Abort update
                return undefined;
            }
            
            const updatedVal = { ...currentVal, count: currentVal.count + 1, upvotedBy: [...currentVal.upvotedBy, userId] }
            functions.logger.log('updated val', JSON.stringify(updatedVal));
            return updatedVal
        } else {
            return null
        }
    }, (error, committed, snapshot)  => {
        if (error) {
            functions.logger.log('Transaction failed abnormally!', error);
        } else if (!committed) {
            functions.logger.log('We aborted the transaction.');
        } else {
            functions.logger.log('question incremented');
        }
        if (snapshot) {
            functions.logger.log("Question: ", snapshot.val());
        }
    });
});

export const askQuestion = functions.https.onCall(async (data, context) => {
    const { userId, correlationId } = data;
    const validUser = await verifyUser(context.auth!.uid, userId)
    if (!validUser) {
        throw new functions.https.HttpsError('failed-precondition', 'error accepting question')
    }
    const question = { ...data, count: 1, upvotedBy: [userId] }
    const db = admin.database();
    const ref = db.ref(`questions/${correlationId}`);
    const pushRef = ref.push(question);
    const { key } = pushRef;
    ref.child(key!).update({key})
});

const verifyUser = async (uid: string, userId: string): Promise<boolean> => {
    const user = await admin.auth().getUser(uid);
    if (!user) {
        return false;
    }
    return user.displayName === userId

}
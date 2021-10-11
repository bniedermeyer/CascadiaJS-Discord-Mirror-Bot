import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { verify } from 'jsonwebtoken';
import axios from 'axios';

admin.initializeApp(functions.config().firebase)
const TENOR_URL_BASE = 'https://g.tenor.com/v1/gifs'

export const postMessage = functions.https.onRequest(async (request, response) => {
    const { body: message, headers } = request;
    const { authorization: authHeader } = headers;
    const token = (authHeader as string).split(' ')[1];

    if (verify(token, functions.config().abbot.key)) {
        if (message.text.match(/^https:\/\/tenor.com\/view\/.*\d+$/)) {
            const gif = await fetchGifInfo(message.text)
            if (gif) {
                message.gif = gif;
            }
        }
        const db = admin.database();
        const ref = db.ref('messages');
        ref.push().set(message)
    } else {
        response.statusCode = 401;
    }

    response.send("ok");
});

const fetchGifInfo = async (gifUrl: string): Promise<{title: string, gifUrl: string, preview: string} | null> => {
    const tenorKey = functions.config().tenor.key;
    const gifId = gifUrl.split('-').pop();
    if (gifId) {
        try {
            const res = await axios.get(`${TENOR_URL_BASE}?ids=${gifId}&media_filter=minimal&key=${tenorKey}`);
            const gifResults: any =  res.data;
            if (gifResults.results) {
                const { results } = gifResults;
                const gifInfo = results[0];
                const { title, media } = gifInfo;
                const gif = media[0].gif;
                const details = {
                    title,
                    gifUrl: gif.url,
                    preview: gif.preview
                }
                return details;
            }
        } catch (error) {
            functions.logger.error('Unable to fetch gif info', error.message)
            return null
        }
    }
    return null;
}
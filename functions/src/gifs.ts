import * as functions from "firebase-functions";
import axios from 'axios';
const TENOR_URL_BASE = 'https://g.tenor.com/v1/gifs'


async function fetchTenorGif(gifUrl: string): Promise<{ alt: string, gifUrl: string, preview: string } | null> {
    const tenorKey = functions.config().tenor.key;
    const gifFileName = gifUrl.split('/').pop();
    const nameArr = gifFileName!.split('-');
    const gifId = nameArr.pop();
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
                    alt: title || nameArr.join (' ').replace('gif', '').trim(),
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

function buildGifInfo(gifUrl: string): { alt: string, gifUrl: string, preview: string }  {
    return {
        gifUrl,
        preview: 'https://i.imgur.com/u5RmuEA.jpeg',
        alt: 'No alt-text available for gif'
    }
}

export const fetchGifInfo = async (url: string, tenor: boolean): Promise<{ alt: string, gifUrl: string, preview: string } | null> => {
    if (tenor) {
        return await fetchTenorGif(url);
    } else {
        return buildGifInfo(url) 
    }
}

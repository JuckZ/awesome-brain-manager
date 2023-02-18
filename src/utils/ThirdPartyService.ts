import { BingChat } from 'bing-chat';
// import { ChatGPTAPI } from 'chatgpt';
import { Configuration, OpenAIApi } from 'openai';
import { oraPromise } from 'ora';

const api = new BingChat({ cookie: 'sdaf' });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY || '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',
});
const openai = new OpenAIApi(configuration);
// const chatGptApi = new ChatGPTAPI({
//     apiKey: process.env.OPENAI_API_KEY || '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',
// });

export const chatWithBing = async () => {
    const prompt = 'Write a poem about cats.';
    const res = await oraPromise(api.sendMessage(prompt), {
        text: prompt,
    });

    return res.text;
};

// export const chatWithChatGPT = async () => {
//     const res = await chatGptApi.sendMessage('Hello world');
//     return res.text || '';
// };

export const chatWithOpenAI = async () => {
    const completion = await openai.createCompletion({
        model: 'text-davinci-002',
        prompt: 'Hello world',
    });

    return completion.data.choices[0].text || '';
};

export const genImageWithChatGPT = async () => {
    const completion = await openai.createImage({
        prompt: 'Hello world',
        n: 1,
    });

    return completion.data.data;
};

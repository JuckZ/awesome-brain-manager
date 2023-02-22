import { BingChat } from 'bing-chat';
// import { ChatGPTAPI } from 'chatgpt';
import { Configuration, OpenAIApi } from 'openai';
import { oraPromise } from 'ora';
import Logger from './logger';

export type ServiceName = 'Bing' | 'OpenAI' | 'ChatGPT' | 'GenImageWithChatGPT' | 'Baidu' | 'Google';
export const ServiceNames = {
    Bing: 'Bing',
    OpenAI: 'OpenAI',
    ChatGPT: 'ChatGPT',
    GenImageWithChatGPT: 'GenImageWithChatGPT',
    Baidu: 'Baidu',
    Google: 'Google',
};
const bingChatApi = new BingChat({ cookie: 'sdaf' });
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);
// const chatGptApi = new ChatGPTAPI({
//     apiKey: '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',
// });

export const chatWithBing = async keyword => {
    const res = await oraPromise(bingChatApi.sendMessage(keyword), {
        text: keyword,
    });

    return res.text;
};

export const chatWithChatGPT = async keyword => {
    // const res = await chatGptApi.sendMessage(keyword);
    // return res.text || '';
    return 'No implement';
};

export const chatWithOpenAI = async keyword => {
    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: keyword,
    });

    Logger.log(completion.data.choices[0].text);
    return completion.data.choices[0].text || '';
};

export const genImageWithChatGPT = async keyword => {
    const completion = await openai.createImage({
        prompt: keyword,
        n: 1,
    });

    return completion.data.data[0].url || '';
};

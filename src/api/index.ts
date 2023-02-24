import { request } from '../utils/request';
import Logger from '../utils/logger';

export type ServiceName = 'Bing' | 'OpenAI' | 'ChatGPT' | 'GenImageWithChatGPT' | 'Baidu' | 'Google';
export const ServiceNames = {
    Bing: 'Bing',
    OpenAI: 'OpenAI',
    ChatGPT: 'ChatGPT',
    GenImageWithChatGPT: 'GenImageWithChatGPT',
    Baidu: 'Baidu',
    Google: 'Google',
};

export const chatWith = async (type: string, keyword: string) => {
    // TODO保证不同人进来，是不同的会话
    const res = await request({
        url: `http://localhost:8080/aichat/${type}?keyword=${keyword}`,
        // url: `https://vercel-express-juckz.vercel.app/aichat/${type}?keyword=${keyword}`,
        method: 'get',
    });
    return res;
};

export const notify = (msg: any, config: any) => {
    let auth = config.NTFY_AUTH;
    if (!auth) {
        auth = process.env.NTFY_AUTH;
    }
    if (auth) {
        request({
            url: 'https://ntfy.ihave.cool/test',
            method: 'post',
            body: 'msg',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        })
            .then(res => Logger.log('Ntfy sent the message successfully'))
            .catch(error => Logger.error('Please check the ntfy configuration first'));
    } else {
        Logger.warn('Please configure ntfy first');
    }
};

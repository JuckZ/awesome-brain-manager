import { LoggerUtil } from '@/utils/logger';
import { SETTINGS } from '@/settings';
import { request } from '@/utils/request';

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
        url: `${SETTINGS.serverHost.value}/api/aichat/${type}?keyword=${keyword}`,
        method: 'get',
    });
    return res;
};

export const notifyNtfy = (msg: any) => {
    const headers = {};
    if (SETTINGS.ntfyToken.value) {
        headers['Authorization'] = `Basic ${SETTINGS.ntfyToken.value}`;
    }
    request({
        url: `${SETTINGS.ntfyServerHost.value}`,
        method: 'post',
        body: msg,
        headers,
    })
        .then(res => LoggerUtil.log('Ntfy sent the message successfully'))
        .catch(error => LoggerUtil.error('Please check the ntfy configuration first'));
};

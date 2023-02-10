import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Notice } from 'obsidian';
import Logger from './logger';

export const createAxiosByinterceptors = (config?: AxiosRequestConfig): AxiosInstance => {
    const instance = axios.create({
        // timeout: 5000,
        // withCredentials: true,
        ...config,
    });

    instance.interceptors.request.use(
        function (config: any) {
            // config.headers.Authorization = vm.$Cookies.get("access_token");
            return config;
        },
        function (error) {
            return Promise.reject(error);
        },
    );

    // 添加响应拦截器
    instance.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            Logger.error(error);
            Logger.error(error?.response?.data?.message || '服务端异常');
            return Promise.reject(error);
        },
    );

    return instance;
};

export const request = createAxiosByinterceptors();

export function notify(msg: any, config: any) {
    Logger.error(msg);
    let auth = config.NTFY_AUTH;
    if (!auth) {
        auth = process.env.NTFY_AUTH;
    }
    Logger.error(auth);
    if (auth) {
        axios
            .post('https://ntfy.ihave.cool/test', 'msg', {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            })
            .then(res => new Notice('Ntfy sent the message successfully'))
            .catch(error => new Notice('Please check the ntfy configuration first'));
    } else {
        new Notice('Please configure ntfy first');
    }
}

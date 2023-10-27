import { merge } from 'lodash-es';
import i18next from 'i18next';
// TODO 对比两个不同的实现
import Backend from 'i18next-locize-backend';
// import Backend from 'i18next-http-backend';
import I18NextVue from 'i18next-vue';
import LanguageDetector from 'i18next-browser-languagedetector';
import LastUsed from 'locize-lastused';
import { locizePlugin } from 'locize';
import zh from '@/locale/zh-cn';
import en from '@/locale/en';

const isProduction = process.env.NODE_ENV === 'production';

const locizeOptions = {
    projectId: process.env.VUE_APP_LOCIZE_PROJECTID as string,
    apiKey: process.env.VUE_APP_LOCIZE_APIKEY as string, // YOU should not expose your apps API key to production!!!
    version: process.env.VUE_APP_LOCIZE_VERSION as string,
};

if (!isProduction) {
    // locize-lastused
    // sets a timestamp of last access on every translation segment on locize
    // -> safely remove the ones not being touched for weeks/months
    // https://github.com/locize/locize-lastused
    i18next.use(LastUsed);
}

export const i18nextPromise = i18next
    // locize-editor
    // InContext Editor of locize
    .use(locizePlugin)
    // i18next-http-backend
    // loads translations from your server
    // https://github.com/i18next/i18next-http-backend
    // TODO
    // .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        saveMissing: !isProduction,
        backend: locizeOptions,
        locizeLastUsed: locizeOptions,
        resources: {
            en: {
                translation: en,
            },
            zh: {
                translation: zh,
            },
        },
    });

export function useI18n(app) {
    app.use(I18NextVue, { i18next });
    return app;
}

class T {
    lang: string;

    all = {
        en,
        zh,
    };

    constructor() {
        this.lang = localStorage.getItem('language') || 'en';
    }

    get texts(): typeof this.all.en {
        const selectLangPack = this.all[this.lang];
        const defaultLangPack = this.all['en'];
        return merge(defaultLangPack, selectLangPack);
    }
}

export default new T().texts;
export const i18nextConst = i18next;

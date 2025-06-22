import { merge } from 'lodash-es';
import i18next, { use } from 'i18next';
// TODO 对比两个不同的实现
// import Backend from 'i18next-locize-backend';
// import Backend from 'i18next-http-backend';
import I18NextVue from 'i18next-vue';
import LanguageDetector from 'i18next-browser-languagedetector';
// import LastUsed from 'locize-lastused';
import { locizePlugin } from 'locize';
import zh from '@/locale/zh-cn';
import en from '@/locale/en';
import { App } from 'vue';

const isProduction = process.env.NODE_ENV === 'production';

// const locizeOptions = {
//     projectId: process.env.VUE_APP_LOCIZE_PROJECTID,
//     apiKey: process.env.VUE_APP_LOCIZE_APIKEY,
//     version: process.env.VUE_APP_LOCIZE_VERSION,
// };

export const i18nextPromise =
    // (isProduction ? use(locizePlugin) : use(LastUsed).use(locizePlugin))
    use(locizePlugin)
        // .use(Backend)
        .use(LanguageDetector)
        // for all options read: https://www.i18next.com/overview/configuration-options
        .init({
            debug: true,
            supportedLngs: ['en', 'zh'],
            fallbackLng: 'en',
            saveMissing: !isProduction,
            // backend: locizeOptions,
            // locizeLastUsed: locizeOptions,
            resources: {
                en: {
                    translation: en,
                },
                zh: {
                    translation: zh,
                },
            },
        });

export function useI18n(app: App) {
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

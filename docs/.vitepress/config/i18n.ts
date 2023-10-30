import i18next, { use } from 'i18next';
import I18NextVue from 'i18next-vue';
import LanguageDetector from 'i18next-browser-languagedetector';
import { locizePlugin } from 'locize';
import { zhLangPack } from './zh'
import { enLangPack } from './en'

export const i18nextPromise =
    use(locizePlugin)
        .use(LanguageDetector)
        .init({
            debug: true,
            fallbackLng: 'en',
            saveMissing: false,
            resources: {
                en: {
                    translation: {
                        ...zhLangPack, 
                        test: 'Test'
                    },
                },
                zh: {
                    translation: {
                        ...enLangPack,
                        test: '测试'
                    },
                },
            },
        });

export function useI18n(app) {
    app.use(I18NextVue, { i18next });
    return app;
}

export const i18nextConst = i18next;

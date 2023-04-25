import { merge } from 'lodash-es';
import en from './locale/en';
import zh from './locale/zh-cn';
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

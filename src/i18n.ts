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
        return this.all[this.lang];
    }
}

export default new T().texts;

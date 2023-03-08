import { beforeAll, describe, expect, it } from 'vitest';
import chalk from 'chalk';

import enPack from '../locale/en';
import zhPack from '../locale/zh-cn';

let languagePack;
describe('i18n', () => {
    beforeAll(() => {
        localStorage.setItem('language', 'zh');
    });
    it('localstorage work fine', () => {
        expect(localStorage.getItem('name')).null;
        localStorage.setItem('name', 'awesome');
        expect(localStorage.getItem('name')).eq('awesome');
    });

    it('should return selected lang', async () => {
        languagePack = (await import('../i18n')).default;
        console.log(languagePack);
        expect(languagePack['__FOR_TEST'].exist.child).eq(zhPack['__FOR_TEST'].exist.child);
    });

    it('should return default lang', () => {
        expect(languagePack['__FOR_TEST'].notExist.child).eq(enPack['__FOR_TEST'].notExist.child);
    });
});

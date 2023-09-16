import type { App } from 'obsidian';
import { request } from '@/utils/request';
import { LoggerUtil } from '@/utils/logger';
import { getAllFiles } from '@/utils/file';

export const searchPicture = async (source: string, keyword: string): Promise<string> => {
    const res: string = await new Promise((resolve, reject) => {
        request({
            url: `https://api.ihave.cool/gen_image/from_keyword?origin=${source}&keyword=${keyword}`,
            method: 'get',
        }).then(res => resolve(res));
    });
    return res || '';
};

export const getLocalRandomImg = async (app: App, title, path: string) => {
    const abstractFile = app.vault.getAbstractFileByPath(path);
    const allImages = await getAllFiles(app, abstractFile, [], ['png', 'jpg', 'jpeg', 'svg', 'gif', 'bmp', 'webp'], []);
    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    if (!randomImage) {
        return '';
    } else {
        return randomImage.path;
    }
};

import type { AxiosResponse } from 'axios';
import { request } from '../utils/request';
import Logger from '../utils/logger';
import { getAllFiles } from '../utils/file';

export const searchPicture = async (source: string, keyword: string): Promise<string> => {
    const res: AxiosResponse = await new Promise((resolve, reject) => {
        request
            .get(`https://api.ihave.cool/gen_image/from_keyword?origin=${source}&keyword=${keyword}`)
            // .get(`http://localhost:8080/gen_image/from_keyword?origin=${source}&keyword=${keyword}`)
            .then(res => {
                Logger.log(res);
                resolve(res);
            })
            .catch(error => reject(error));
    });
    if (res.status === 200 && res?.data) {
        return res.data;
    } else {
        return '';
    }
};

export const getLocalRandomImg = async (app, title, path: any) => {
    path = app.vault.getAbstractFileByPath(path)
    const allImages = await getAllFiles(app, path, [], ['png', 'jpg', 'jpeg', 'svg', 'gif', 'bmp', 'webp'], []);
    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    if (!randomImage) {
        return '';
    } else {
        return randomImage.path;
    }
};

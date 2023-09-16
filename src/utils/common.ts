export function getTaskContentFromTask(task: string): string {
    task = task.replace(/[✅🔁⏳📅🔼⏫🔽] .*/u, '');
    return task.replace(/ #\w*/g, '');
}

export function getTagsFromTask(task: string): string[] {
    return task.match(/ #\w*/g)?.map(tag => tag.split(' #')[1]) || [];
}

export function randomColor() {
    return 'rgb(' + ~~(Math.random() * 255) + ',' + ~~(Math.random() * 255) + ',' + ~~(Math.random() * 255) + ')';
}

export const treeUtil = {
    uniq: (a: any[]) => [...new Set(a)],
};

export function getNumberFromStr(str: string) {
    const nums = str.match(/\d+(.\d+)?/g);
    return nums?.map(num => parseFloat(num)) || [];
}

export function deepCloneObj(source) {
    // TODO
    // const target = {};
    // for (const key in source) {
    //     if (typeof source[key] === 'object' && source[key] !== null) {
    //         target[key] = deepClone(source[key]);
    //     } else {
    //         target[key] = source[key];
    //     }
    // }
    // return target;
}

export function deepCloneArr(source) {
    // TODO
}

export function deepClone(source) {
    // TODO
}

export function genId(size: number) {
    const chars: string[] = [];
    for (let n = 0; n < size; n++) chars.push(((16 * Math.random()) | 0).toString(16));
    return chars.join('');
}

export async function getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async position => {
            resolve(position);
        }, reject);
    });
}

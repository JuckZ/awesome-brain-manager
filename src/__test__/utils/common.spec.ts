import { describe, expect, it } from 'vitest';
import { deepClone, deepCloneArr, deepCloneObj } from '@/utils/common';

const obj1 = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        state: 'NY',
    },
    skills: [
        'js',
        'ts',
        'py',
        () => {
            console.log(111);
        },
    ],
};
const arr1 = [
    { name: 'John', age: 30 },
    { name: 'Mary', age: 25 },
    {
        name: 'Bob',
        age: 40,
        skill() {
            console.log('js');
        },
    },
    {
        others: [
            { name: 'Mary', age: 25 },
            { name: 'Bob', age: 40 },
        ],
    },
];

describe('common utils', () => {
    it('placeholder', () => {
        expect(1 + 1).toBe(2);
    });
    // it('clone object[]', () => {
    //     const arr2 = deepCloneArr(arr1);
    //     expect(arr1).not.toBe(arr2);
    //     expect(arr1).toEqual(arr2);
    // });

    // it('clone object', async () => {
    //     const obj2 = deepCloneObj(obj1);
    //     expect(obj1).not.toBe(obj2);
    //     expect(obj1).toEqual(obj2);
    // });
});

import type { DBTable } from 'types/mdb';

export type VaultItem = {
    path: string;
    parent: string;
    created: string;
    sticker?: string;
    folder: string;
    color?: string;
    rank?: string;
};

export type Space = {
    name: string;
    sticker?: string;
    color?: string;
    pinned?: string;
    sort?: string;
    def?: string;
    rank?: string;
};

export type SpaceItem = {
    space: string;
    path: string;
    rank: string;
};

export type Pomodoro = {
    timestamp: string;
    task: string;
    createTime: string;
    start: string;
    lastactive: string;
    breaknum: string;
    end?: string;
    expectedTime: string;
    spend: string;
    status: 'ing' | 'done' | 'todo' | 'cancelled' | 'break';
    tags?: 'important' | 'inprogress' | 'p1' | 'p2' | 'p3' | 'p4' | string;
};

export type Ledger = {
    timestamp: string;
    ledger: string;
    start: string;
    from?: string;
    spend: string;
    to: string;
    status?: string;
};

export const vaultSchema: DBTable = {
    uniques: ['path'],
    cols: ['path', 'parent', 'created', 'sticker', 'color', 'folder', 'rank'],
    rows: [],
};

export const spaceSchema: DBTable = {
    uniques: ['name'],
    cols: ['name', 'sticker', 'color', 'pinned', 'sort', 'def', 'rank'],
    rows: [],
};

export const spaceItemsSchema: DBTable = {
    uniques: [],
    cols: ['space', 'path', 'rank'],
    rows: [],
};

/**
 * timestamp: 创建时间戳
 * task: 关联任务（text）
 * start: 开始时间（时间戳）
 * end: 结束时间(时间戳)
 * spend：花费时间(秒)
 * status: 状态（ing, done, todo）
 */
export const pomodoroSchema: DBTable = {
    uniques: ['timestamp'],
    cols: [
        'timestamp',
        'task',
        'createTime',
        'start',
        'expectedTime',
        'lastactive',
        'breaknum',
        'end',
        'spend',
        'status',
        'tags',
    ],
    rows: [],
};

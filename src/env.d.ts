/// <reference types="vite/client" />
import type { moment } from 'obsidian';

declare const electron: any;
declare global {
    function moment(): Moment;
}
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly env: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

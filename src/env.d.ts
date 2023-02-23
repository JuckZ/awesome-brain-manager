/// <reference types="vite/client" />
import type { moment } from 'obsidian';

declare const electron: any;
declare global {
    function moment(): Moment;
}

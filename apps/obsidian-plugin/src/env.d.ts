/// <reference types="vite/client" />
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const electron: any;
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly env: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

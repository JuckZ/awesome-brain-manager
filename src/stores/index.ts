import { createPinia } from 'pinia';
import { useEditorStore } from './editor';
import { useSystemStore } from './system';
const pinia = createPinia();
export default pinia;
export { useEditorStore, useSystemStore };

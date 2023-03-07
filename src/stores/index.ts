import { createPinia } from 'pinia';
import { useEditorStore } from './editor';
import { useSystemStore } from './system';
import { usePomodoroStore } from './pomodoro';
const pinia = createPinia();
export default pinia;
export { useEditorStore, useSystemStore, usePomodoroStore };

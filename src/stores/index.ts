import { createPinia } from 'pinia';
import { useSystemStore } from '@/stores/system';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useEditorStore } from '@/stores/editor';
const pinia = createPinia();
export default pinia;
export { useEditorStore, useSystemStore, usePomodoroStore };

import { createPinia } from 'pinia';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useEditorStore } from '@/stores/editor';

const pinia = createPinia();

export { usePomodoroStore, useEditorStore };
export default pinia;

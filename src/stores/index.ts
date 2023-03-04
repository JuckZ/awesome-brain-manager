import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useEditorStore } from '@/stores/editor';

import CustomViewContainer from '../ui/CustomViewContainer.vue';

const customViewVueApp = createApp(CustomViewContainer);

customViewVueApp.use(createPinia())
export { usePomodoroStore, useEditorStore, customViewVueApp };

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePomodoroStore = defineStore('pomodoro', () => {
    const totalTask = ref(0);
    function increment() {
        totalTask.value++;
    }
    return {
		totalTime: 0,
        totalTask,
        increment,
    };
});

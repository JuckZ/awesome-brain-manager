import type { Pomodoro } from '@/schemas/spaces';
import { DBUtil } from '@/utils/db/db';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

// TODO 将数据持久化，优化性能 注意不同设备之间的持久化策略
export const usePomodoroStore = defineStore('pomodoro', () => {
    const totalTask = ref(0);
    const currentPomodoro: Ref<Pomodoro | null> = ref(null);
    const pomodoroHistory: Ref<Pomodoro[]> = ref([]);

    function updatePomodoro(pomodoro: Pomodoro) {
        DBUtil.updatePomodoro(pomodoro);
        const updateIndex = pomodoroHistory.value.findIndex(item => item.timestamp === pomodoro.timestamp);
        pomodoroHistory.value[updateIndex] = pomodoro;
        if (pomodoro.timestamp === currentPomodoro.value?.timestamp && pomodoro.status === 'done') {
            currentPomodoro.value = null;
        } else if (pomodoro.status === 'ing') {
            currentPomodoro.value = pomodoro;
        }
    }

    async function loadPomodoroData() {
        const data = await DBUtil.loadPomodoroData();
        pomodoroHistory.value = data;
        currentPomodoro.value = data.filter(pomodoro => pomodoro.status === 'ing')[0] as Pomodoro;
    }

    function addPomodoro(pomodoro: Pomodoro) {
        DBUtil.addPomodoro(pomodoro);
        pomodoroHistory.value.push(pomodoro);
    }

    function deletePomodoro(pomodoro: Pomodoro) {
        DBUtil.deletePomodoro(pomodoro);
        pomodoroHistory.value = pomodoroHistory.value.filter(item => item.timestamp !== pomodoro.timestamp);
        if (currentPomodoro.value && currentPomodoro.value.timestamp === pomodoro.timestamp) {
            currentPomodoro.value = null;
        }
    }

    return {
        currentPomodoro,
        totalTime: 0,
        totalTask,
        pomodoroHistory,
        loadPomodoroData,
        addPomodoro,
        updatePomodoro,
        deletePomodoro,
    };
});

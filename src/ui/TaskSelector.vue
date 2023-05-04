<template>
    <div>
        <div @click="openSelectorModal">专注 +</div>
        <div class="taskListContainer">
            <div
                v-for="task in taskList"
                :key="task.id"
                @mouseenter="previewTask($event, task)"
                @click="onClicked($event, task)"
            >
                <input type="checkbox" :checked="task.status !== ' '" @click="onChecked($event, task)" />
                {{ task.text }}
            </div>
        </div>
        <div>
            <div id="helloEl">hello</div>
            <n-modal
                v-model:show="showModal"
                :mask-closable="false"
                preset="dialog"
                title="确认"
                content="你确认"
                positive-text="确认"
                negative-text="算了"
                @positive-click="onPositiveClick"
                @negative-click="onNegativeClick"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { Component, MarkdownPreviewView, MarkdownView, Platform } from 'obsidian';
import { type SListItem, STask, getAPI as getDataviewApi } from 'obsidian-dataview';
import { type Ref, ref } from 'vue';
import { CommonModal } from '@/ui/modal';

import {
    concentrateTasks,
    importantTasks,
    listTasks,
    queryAll,
    queryImportantTasks,
    rewriteTask,
    setTaskCompletion,
} from '@/utils/dataview';

const message = useMessage();
const showModal = ref(false);
const taskList: Ref<STask[]> = ref([]);

const DataviewAPI = getDataviewApi();

const openSelectorModal = () => {
    console.log(123123);

    const modal = new CommonModal(window.app, activeDocument.querySelector('#helloEl'));
    modal.open();
    showModal.value = true;
};
</script>

<style lang="scss" scoped>
.taskListContainer {
    margin: 8px 0;
    max-height: 300px;
    max-width: 100%;
    cursor: pointer;
    overflow-y: scroll;
    word-wrap: break-word;
    word-break: break-all;
    overflow-x: hidden;

    input {
        cursor: pointer;
    }

    div {
        padding: 4px 8px;
        border-radius: 4px;
        margin: 4px 0;
        background-color: rgba(0, 0, 0, 0.1);
        transition: background-color 0.2s ease-in-out;
    }
    div:hover {
        background-color: rgba(0, 183, 255, 0.692);
    }
}
</style>

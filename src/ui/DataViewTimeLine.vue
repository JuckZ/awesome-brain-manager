<template>
    <div>
        <button @click="searchHandle">查询</button>
        <div id="resultContainer"></div>
        <!-- <Teleport to="body" disable="false">
            <div v-html="mdText"></div>
        </Teleport> -->
        <div v-for="task in taskList" :key="task.blockId" @mouseenter="previewTask(task)" @click="completeTask(task)">
            {{ task.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { Component, MarkdownPreviewView, MarkdownView } from 'obsidian';
import { STask, getAPI as getDataviewApi } from 'obsidian-dataview';
import { type Ref, ref } from 'vue';
import { listTasks, queryAll, queryImportantTasks } from '@/utils/dataview';

const keyword = ref('');
let mdText = ref('');
const taskList: Ref<STask[]> = ref([]);

const searchHandle = async () => {
    const DataviewAPI = getDataviewApi();
    // query
    mdText.value = (await DataviewAPI.queryMarkdown(listTasks)).value;

    // taskList.value
    const res = await DataviewAPI.query(listTasks);
    taskList.value = res.value.values;
    console.log(taskList.value);
    const component = new Component();
    const container = document.querySelector('#resultContainer');
    // executeJs
    // const res = await DataviewAPI.execute(queryImportantTasks, container, component, '');
    // console.log(res);
};

const previewTask = async (task: STask) => {
    // xxx
    console.log('previewTask', task);
};

const completeTask = async (task: STask) => {
    console.log('completeTask', task);
};
</script>

<style lang="scss" scoped></style>

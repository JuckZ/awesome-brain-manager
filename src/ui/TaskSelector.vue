<template>
    <div>
        <span class="cursor-pointer flex items-center p1" @click="openSelectorModal">
            <n-gradient-text type="info" class="mr1"> 快捷添加 </n-gradient-text>
            <n-icon size="20" color="rgb(178, 209, 244)">
                <AddCircleOutline />
            </n-icon>
        </span>

        <n-modal
            v-model:show="showModal"
            :mask-closable="true"
            preset="dialog"
            :show-icon="false"
            @positive-click="onPositiveClick"
            @negative-click="onNegativeClick"
        >
            <DataViewTimeLine></DataViewTimeLine>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { NGradientText, NIcon, NModal, useMessage } from 'naive-ui';
import { Component, MarkdownPreviewView, MarkdownView, Platform } from 'obsidian';
import { type Ref, ref } from 'vue';
import { AddCircleOutline } from '@vicons/ionicons5';
import DataViewTimeLine from '@/ui/DataViewTimeLine.vue';
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
const onPositiveClick = () => {
    message.success({
        title: '成功',
        content: '你点击了确认',
    });
    showModal.value = false;
};
const onNegativeClick = () => {
    message.info({
        title: '提示',
        content: '你点击了取消',
    });
    showModal.value = false;
};

const openSelectorModal = () => {
    showModal.value = true;
    // activeDocument.body.createEl('div', {
    //     attr: {
    //         id: 'helloEl',
    //     },
    // });
    // const modal = new CommonModal(window.app, activeDocument.querySelector('#helloEl'));
    // modal.open();
};
</script>

<style lang="scss" scoped></style>

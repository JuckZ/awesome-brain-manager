<template>
    <div>
        <div>
            <n-form
                ref="formRef"
                :model="model"
                label-placement="left"
                label-width="auto"
                size="small"
                :style="{
                    maxWidth: '640px',
                }"
            >
                <n-form-item label="Task" path="taskName">
                    <n-input v-model:value="model.taskName" placeholder="Input" />
                </n-form-item>
                <n-form-item label="Status" path="status">
                    <n-select v-model:value="model.status" placeholder="Status" :options="statusList" multiple />
                </n-form-item>
                <n-form-item label="Due" path="dueRange">
                    <n-date-picker v-model:value="model.dueRange" type="daterange" clearable />
                </n-form-item>
                <n-form-item label="Scheduled" path="scheduledRange">
                    <n-date-picker v-model:value="model.scheduledRange" type="daterange" clearable />
                </n-form-item>
                <n-form-item label="Start" path="startRange">
                    <n-date-picker v-model:value="model.startRange" type="daterange" clearable />
                </n-form-item>
            </n-form>
        </div>
        <div class="taskListContainer">
            <n-list hoverable clickable>
                <n-list-item v-for="task in taskList" :key="task.id">
                    <n-thing
                        content-style="margin-top: 10px;"
                        @click="onClicked($event, task)"
                        @mouseenter="previewTask($event, task)"
                        @mouseleave="cancelPreviewTask($event, task)"
                    >
                        <template #description>
                            <n-space size="small" style="margin-top: 4px">
                                <n-tag v-for="tag in task.tags" :key="tag" :bordered="false" type="info" size="small">
                                    {{ tag }}
                                </n-tag>
                            </n-space>
                            <n-icon size="20" @click="onChecked($event, task)">
                                <CheckmarkCircleOutline :color="task.status !== ' ' ? 'green' : ''" />
                            </n-icon>
                            {{ task.text }}
                        </template>
                    </n-thing>
                </n-list-item>
            </n-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Component, MarkdownPreviewView, MarkdownView, Platform } from 'obsidian';
import { type SListItem, STask, getAPI as getDataviewApi } from 'obsidian-dataview';
import { type Ref, ref } from 'vue';
import {
    NDatePicker,
    NForm,
    NFormItem,
    NIcon,
    NInput,
    NList,
    NListItem,
    NSelect,
    NSpace,
    NTag,
    NThing,
} from 'naive-ui';
import { CheckmarkCircleOutline } from '@vicons/ionicons5';
import { debounce } from 'lodash-es';
import {
    concentrateTasks,
    importantTasks,
    listTasks,
    queryAll,
    queryImportantTasks,
    rewriteTask,
    setTaskCompletion,
} from '@/utils/dataview';
import { eventTypes } from '@/types/types';

const keyword = ref('');
let mdText = ref('');
const taskList: Ref<STask[]> = ref([]);
const model = ref({
    taskName: '',
    status: [],
    dueRange: null,
    scheduledRange: null,
    startRange: null,
});
// 🟠🟣🟤⚫
const statusList = ref([
    {
        label: '🔵 Active',
        value: ' ', // ' '
    },
    {
        label: '🟢 Completed',
        value: 'x', // x
    },
    {
        label: '🟡 Ing',
        value: 'd', // d /
    },
    {
        label: '🔴 Cancelled',
        value: 'C', // C
    },
]);

const DataviewAPI = getDataviewApi();
const searchHandle = async () => {
    // query
    // mdText.value = (await DataviewAPI.queryMarkdown(listTasks)).value;
    // TODO 按照表单条件查询任务
    const res = await DataviewAPI.query(concentrateTasks);
    taskList.value = res.value.values;
};

searchHandle();

// DataviewAPI.index.revision
const refreshOperation = async () => {
    searchHandle();
};
// DataviewAPI.index.onChange(refreshOperation);
app.workspace.on('dataview:refresh-views', refreshOperation);
let lastHoverTask: STask = null;
let lastTimer = null;
const previewTask = async (event, item: STask) => {
    // 延迟触发 当悬停在同一个任务上600ms时，触发 previewTask
    lastHoverTask = item;
    lastTimer = setTimeout(() => {
        if (item.id === lastHoverTask.id) {
            const evt = new CustomEvent(eventTypes.previewCursor, {
                detail: {
                    originEvent: event,
                    cursorTarget: item,
                },
            });
            window.dispatchEvent(evt);
        }
    }, 600);
};
// 鼠标移出后取消触发
const cancelPreviewTask = async (event, item: STask) => {
    clearTimeout(lastTimer);
};

type SelectionState = {
    estate: {
        cursor: {
            from: { line: number; ch: number };
            to: { line: number; ch: number };
        };
    };
    line: number;
};

const onClicked = async (evt, item: STask) => {
    const selectionState: SelectionState = {
        eState: {
            cursor: {
                from: { line: item.line, ch: item.position.start.col },
                to: { line: item.line + item.lineCount - 1, ch: item.position.end.col },
            },
            line: item.line,
        },
    };

    app.workspace.openLinkText(
        item.link.toFile().obsidianLink(),
        item.path,
        evt.ctrlKey || (evt.metaKey && Platform.isMacOS),
        selectionState,
    );
};

const onChecked = async (evt, item: STask) => {
    evt.stopPropagation();
    const completed = item.checked;
    const status = completed ? ' ' : 'x';
    // Update data-task on the parent element (css style)
    const parent = evt.currentTarget.parentElement;
    parent?.setAttribute('data-task', status);

    let flatted: STask[] = [item];

    const recursiveSubTaskCompletion = true;
    const taskCompletionTracking = true;
    const taskCompletionUseEmojiShorthand = true;
    const taskCompletionText = 'completion';
    const taskCompletionDateFormat = 'yyyy-MM-dd';

    function flatter(iitem: STask | SListItem) {
        flatted.push(iitem as STask);
        iitem.children.forEach(flatter);
    }
    if (recursiveSubTaskCompletion) {
        item.children.forEach(flatter);
        flatted = flatted.flat(Infinity);
    }

    async function effectFn() {
        for (let i = 0; i < flatted.length; i++) {
            const _item = flatted[i];
            let updatedText: string = _item.text;
            if (taskCompletionTracking) {
                updatedText = setTaskCompletion(
                    _item.text,
                    taskCompletionUseEmojiShorthand,
                    taskCompletionText,
                    taskCompletionDateFormat,
                    completed,
                );
            }
            await rewriteTask(app.vault, _item, status, updatedText);
        }
        app.workspace.trigger('dataview:refresh-views');
    }
    effectFn();
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

    & > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
        border-radius: 4px;
        margin: 4px 0;
        background-color: rgba(0, 0, 0, 0.1);
        transition: background-color 0.2s ease-in-out;
    }
    & > div:hover {
        background-color: rgba(0, 0, 0, 0.3);
    }
}
</style>

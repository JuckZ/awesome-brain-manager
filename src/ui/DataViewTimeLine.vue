<template>
    <div>
        <div class="taskListContainer">
            <div v-for="task in taskList" :key="task.id" @click="onClicked($event, task)">
                <div>
                    <input type="checkbox" :checked="task.status !== ' '" @click="onChecked($event, task)" />
                    {{ task.text }}
                </div>
                <n-icon @mouseenter="previewTask($event, task)">
                    <EyeOutline />
                </n-icon>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Component, MarkdownPreviewView, MarkdownView, Platform } from 'obsidian';
import { type SListItem, STask, getAPI as getDataviewApi } from 'obsidian-dataview';
import { type Ref, ref } from 'vue';
import { NIcon } from 'naive-ui';
import { EyeOutline } from '@vicons/ionicons5';
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

const DataviewAPI = getDataviewApi();
const searchHandle = async () => {
    // query
    // mdText.value = (await DataviewAPI.queryMarkdown(listTasks)).value;
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

const debouncePreview = debounce((event, item: STask) => {
    const evt = new CustomEvent(eventTypes.previewCursor, {
        detail: {
            originEvent: event,
            cursorTarget: item,
        },
    });
    window.dispatchEvent(evt);
}, 400);
const previewTask = async (event, item: STask) => {
    // 延迟触发，鼠标移出后取消触发
    debouncePreview(event, item);
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
    const completed = evt.currentTarget.checked;
    const status = completed ? 'x' : ' ';
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

<template>
    <h2>safsadfsdfsdah2</h2>
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { NNotificationProvider, NSpace, useNotification } from 'naive-ui';
import t from '../i18n';

const props = defineProps<{}>();

onMounted(async () => {
    console.log('ssss');
});

onUnmounted(() => {
    console.log('4444');
});
</script>

<style scoped lang="scss">
.radialTimeText {
    font-size: 32px;
    font-weight: 600;
}
</style>

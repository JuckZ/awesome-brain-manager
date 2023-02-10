import { defineComponent } from 'vue';
export default defineComponent({
    setup() {
        return () => <A></A>;
    },
});

const A = defineComponent({
    setup() {
        return () => <>番茄钟数据看板</>;
    },
});

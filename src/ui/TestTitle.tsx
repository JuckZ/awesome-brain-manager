import { defineComponent } from 'vue';
import { NGradientText } from 'naive-ui';
import t from '@/i18n';

export default defineComponent({
    setup() {
        return () => <A></A>;
    },
});

const A = defineComponent({
    setup() {
        return () => <NGradientText type="primary">{t.info.Pomodoro}</NGradientText>;
    },
});

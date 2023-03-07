import { defineComponent } from 'vue';
import t from '../i18n';

export default defineComponent({
    setup() {
        return () => <A></A>;
    },
});

const A = defineComponent({
    setup() {
        return () => <>{t.info.Pomodoro}</>;
    },
});

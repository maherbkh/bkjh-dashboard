<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';

const props = defineProps({
    minDate: {
        type: [Date, String],
        default: null,
    },
    maxDate: {
        type: [Date, String],
        default: null,
    },
    flexTitle: {
        type: Boolean,
        default: false,
    },
    label: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    timePicker: {
        type: Boolean,
        default: true,
    },
    errors: {
        type: Array,
        default: () => [],
    },
    autocomplete: {
        type: String,
        default: 'off',
    },
    icon: {
        type: String,
        default: 'solar:calendar-linear',
    },
    format: {
        type: String,
        default: null,
    },
    required: {
        type: Boolean,
        default: false,
    },
    onlyTime: {
        type: Boolean,
        default: false,
    },
    autoApply: {
        type: Boolean,
        default: true,
    },
    range: {
        type: Boolean,
        default: false,
    },
    locale: {
        type: [String, Object],
        default: null,
    },
    weekStart: {
        type: Number,
        default: undefined,
    },
    modelValue: {
        type: [String, Date, Object],
        default: '',
    },
});

const emit = defineEmits(['update:model-value']);
const { locale: i18nLocale, locales } = useI18n();
const { formatDateOnly } = useGermanDateFormat();

// Get available locales like AppLangSelector
const availableLocales = computed(() => {
    return (locales.value).map(l => ({
        code: l.code,
        name: l.name || l.code,
    }));
});

// Resolve locale and week start from Nuxt i18n when not provided via props
const resolvedLocale = computed(() => {
    const val = props.locale || i18nLocale.value || 'de';
    return val === 'en' ? 'en' : 'de';
});
const resolvedWeekStart = computed(() => {
    if (typeof props.weekStart === 'number') return props.weekStart;
    return String(resolvedLocale.value).startsWith('en') ? 0 : 1;
});
const value = ref(props.modelValue);
onMounted(() => {
    value.value = props.modelValue;
});
watchEffect(() => {
    emit('update:model-value', value.value);
});
watchEffect(() => {
    value.value = props.modelValue;
});

// Display formatting handled directly in the input slot; model remains yyyy-MM-dd
</script>

<template>
    <div class="grid w-full items-center gap-2">
        <Label
            v-if="label"
            :for="name"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            {{ label }}
            <span
                v-if="required"
                class="text-destructive font-semibold"
            >*</span>
        </Label>
        <VueDatePicker
            :key="String(resolvedLocale)"
            v-model="value"
            :teleport="false"
            :enable-time-picker="timePicker"
            :time-picker="onlyTime"
            :auto-apply="autoApply"
            :locale="resolvedLocale"
            :week-start="resolvedWeekStart"
            :format="format ? format : timePicker ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'"
            :model-type="format ? format : timePicker ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'"
            :autocomplete="autocomplete"
            :placeholder="placeholder"
            :name="name"
            :range="range"
            :readonly="readonly"
            :disabled="disabled"
            :min-date="minDate"
            :max-date="maxDate"
            :class="{ 'has-error': errors.length > 0 }"
        >
            <template #dp-input="{ value: inputValue }">
                <div class="relative w-full cursor-pointer">
                    <div
                        v-if="icon"
                        class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2"
                    >
                        <Icon
                            :name="icon"
                            class="size-6 text-muted-foreground"
                        />
                    </div>
                    <input
                        :placeholder="placeholder"
                        class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background border-input flex h-8 w-full min-w-0 rounded-full border px-4 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-5 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        :class="[icon ? 'pl-8' : '']"
                        type="text"
                        :value="onlyTime ? String(inputValue || '') : formatDateOnly(inputValue)"
                    >
                </div>
            </template>
        </VueDatePicker>

        <div
            v-if="errors.length > 0"
            class="text-destructive text-sm mt-0.5"
        >
            <div
                v-for="(error, i) in errors"
                :key="i"
                :class="[(icon && 'pl-8')]"
            >
                - {{ error.$message || error }}
            </div>
        </div>
    </div>
</template>

<style>
/* moved to app/assets/css/main.css under @layer utilities */
</style>

<script setup>
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { de, enUS } from 'date-fns/locale';

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
const { formatDate, formatDateOnly } = useGermanDateFormat();

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
    // vue-datepicker 12.x passes the locale prop directly to date-fns format/parse,
    // so it must be a date-fns locale object — not a string.
    return val === 'en' ? enUS : de;
});
const resolvedWeekStart = computed(() => {
    if (typeof props.weekStart === 'number') return props.weekStart;
    return resolvedLocale.value.code.startsWith('en') ? 0 : 1;
});
const resolvedFormat = computed(() => {
    return props.format ? props.format : props.timePicker ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
});

function valueToComparable(input) {
    if (input instanceof Date) {
        return input.getTime();
    }

    if (Array.isArray(input)) {
        return JSON.stringify(input.map(valueToComparable));
    }

    if (input && typeof input === 'object') {
        try {
            return JSON.stringify(input);
        }
        catch {
            return String(input);
        }
    }

    return input ?? null;
}

function isSameValue(a, b) {
    return valueToComparable(a) === valueToComparable(b);
}

const value = ref(props.modelValue);

watch(
    () => props.modelValue,
    (nextValue) => {
        if (!isSameValue(nextValue, value.value)) {
            value.value = nextValue;
        }
    },
    { immediate: true },
);

function onUpdateModelValue(nextValue) {
    value.value = nextValue;
    if (!isSameValue(nextValue, props.modelValue)) {
        emit('update:model-value', nextValue);
    }
}

const germanDisplayFormat = computed(() => {
    return props.timePicker ? 'DD.MM.YYYY, HH:mm' : 'DD.MM.YYYY';
});

function formatDisplayValue(inputValue) {
    if (props.onlyTime) {
        return String(inputValue || '');
    }

    if (Array.isArray(value.value)) {
        const [start, end] = value.value;
        const startFormatted = start ? formatDate(start, germanDisplayFormat.value) : '';
        const endFormatted = end ? formatDate(end, germanDisplayFormat.value) : '';
        if (startFormatted && endFormatted) {
            return `${startFormatted} - ${endFormatted}`;
        }
        return startFormatted || String(inputValue || '');
    }

    if (typeof value.value === 'string' || value.value instanceof Date) {
        const formatted = formatDate(value.value, germanDisplayFormat.value);
        return formatted || String(inputValue || formatDateOnly(inputValue));
    }

    return String(inputValue || formatDateOnly(inputValue));
}

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
            :key="resolvedLocale.code"
            :model-value="value"
            :teleport="true"
            :enable-time-picker="timePicker"
            :time-picker="onlyTime"
            :auto-apply="autoApply"
            :locale="resolvedLocale"
            :week-start="resolvedWeekStart"
            :format="resolvedFormat"
            :model-type="resolvedFormat"
            :autocomplete="autocomplete"
            :placeholder="placeholder"
            :name="name"
            :range="range"
            :readonly="readonly"
            :disabled="disabled"
            :min-date="minDate"
            :max-date="maxDate"
            :class="{ 'has-error': errors.length > 0 }"
            @update:model-value="onUpdateModelValue"
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
                        :value="formatDisplayValue(inputValue)"
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

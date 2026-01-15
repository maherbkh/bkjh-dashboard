<script setup lang="ts">
import { cn } from '@/lib/utils';

const { t } = useI18n();

const props = withDefaults(defineProps<{
    id?: string;
    title?: string;
    description?: string;
    modelValue?: boolean;
    disabled?: boolean;
    required?: boolean;
    errors?: string[];
    trueLabel?: string;
    falseLabel?: string;
    flexRow?: boolean;
    showSideLabel?: boolean;
}>(), {
    modelValue: false,
    disabled: false,
    required: false,
    errors: () => [],
    flexRow: false,
    showSideLabel: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const switchValue = computed<boolean>({
    get: () => props.modelValue ?? false,
    set: val => emit('update:modelValue', val),
});

// Use translations for labels if not provided
const displayTrueLabel = computed(() => props.trueLabel || t('common.on'));
const displayFalseLabel = computed(() => props.falseLabel || t('common.off'));

// Computed wrapper classes
const wrapperClasses = computed(() =>
    cn('grid w-full items-center gap-1.5', props.flexRow && 'flex items-center justify-between space-x-2'),
);
</script>

<template>
    <div :class="wrapperClasses">
        <Label
            v-if="title"
            :for="id"
        >
            {{ title }}
            <span
                v-if="required"
                class="text-destructive font-semibold"
            >*</span>
        </Label>
        <div class="flex items-center space-x-2">
            <Switch
                :id="id"
                v-model="switchValue"
                v-bind="$attrs"
                :disabled="disabled"
                :aria-invalid="errors.length > 0"
            />
            <Label
                v-if="showSideLabel && (displayTrueLabel || displayFalseLabel)"
                :for="id"
                class="text-sm text-muted-foreground"
            >
                {{ switchValue ? displayTrueLabel : displayFalseLabel }}
            </Label>
        </div>
        <p
            v-if="description"
            class="text-xs text-muted-foreground"
        >
            {{ description }}
        </p>
        <div
            v-if="errors.length"
            class="text-destructive text-xs mt-0.5"
        >
            <div
                v-for="(err, i) in errors"
                :key="i"
            >
                - {{ err }}
            </div>
        </div>
    </div>
</template>

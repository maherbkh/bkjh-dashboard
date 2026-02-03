<script setup lang="ts">
import type { EventQuestionRatingConfig } from '~/types/event-question';

const { t } = useI18n();

type Props = {
    modelValue?: EventQuestionRatingConfig;
    errors?: string[];
    disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({
        min: 0,
        max: 5,
        step: 1,
    }),
    errors: () => [],
    disabled: false,
});

const emit = defineEmits<{
    'update:modelValue': [config: EventQuestionRatingConfig];
}>();

const config = computed({
    get: () => props.modelValue || { min: 0, max: 5, step: 1 },
    set: val => emit('update:modelValue', val),
});

const updateField = <K extends keyof EventQuestionRatingConfig>(
    field: K,
    value: EventQuestionRatingConfig[K],
) => {
    config.value = {
        ...config.value,
        [field]: value,
    };
};

const updateLabel = (field: 'min' | 'max', value: string): void => {
    const trimmedValue = value.trim();
    config.value = {
        ...config.value,
        labels: {
            ...(config.value.labels || {}),
            [field]: trimmedValue || undefined,
        },
    };
};
</script>

<template>
    <div class="space-y-3">
        <Label class="text-sm font-medium">
            {{ t('event.questions.rating_config.title') }}
        </Label>

        <div class="grid grid-cols-3 gap-2">
            <FormItemInput
                id="rating-min"
                v-model.number="config.min"
                type="number"
                :title="t('event.questions.rating_config.minimum')"
                placeholder="0"
                :required="true"
                :disabled="disabled"
                :min="0"
                @update:model-value="(val) => updateField('min', Number(val))"
            />
            <FormItemInput
                id="rating-max"
                v-model.number="config.max"
                type="number"
                :title="t('event.questions.rating_config.maximum')"
                placeholder="5"
                :required="true"
                :disabled="disabled"
                :min="1"
                :max="100"
                @update:model-value="(val) => updateField('max', Number(val))"
            />
            <FormItemInput
                id="rating-step"
                v-model.number="config.step"
                type="number"
                :title="t('event.questions.rating_config.step')"
                placeholder="1"
                :disabled="disabled"
                :min="0.1"
                @update:model-value="(val) => updateField('step', val ? Number(val) : undefined)"
            />
        </div>

        <div class="grid grid-cols-2 gap-2">
            <FormItemInput
                id="rating-min-label"
                :model-value="config.labels?.min || ''"
                :title="t('event.questions.rating_config.minimum_label')"
                :placeholder="t('event.questions.rating_config.min_label_placeholder')"
                :disabled="disabled"
                @update:model-value="(val) => updateLabel('min', String(val || ''))"
            />
            <FormItemInput
                id="rating-max-label"
                :model-value="config.labels?.max || ''"
                :title="t('event.questions.rating_config.maximum_label')"
                :placeholder="t('event.questions.rating_config.max_label_placeholder')"
                :disabled="disabled"
                @update:model-value="(val) => updateLabel('max', String(val || ''))"
            />
        </div>

        <div
            v-if="errors && errors.length > 0"
            class="text-destructive text-xs"
        >
            <div
                v-for="(err, i) in errors"
                :key="i"
            >
                - {{ err }}
            </div>
        </div>

        <p class="text-xs text-muted-foreground">
            {{ t('event.questions.rating_config.hint') }}
        </p>
    </div>
</template>

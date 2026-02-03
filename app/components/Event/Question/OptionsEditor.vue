<script setup lang="ts">
import type { EventQuestionOption } from '~/types/event-question';
import { labelToOptionValue } from '~/composables/useEventQuestions';

const { t } = useI18n();

type Props = {
    modelValue: EventQuestionOption[];
    errors?: string[];
    disabled?: boolean;
    /** When true (e.g. question has answers), existing option rows are read-only but Add Option stays enabled. */
    readonlyExistingOptions?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    errors: () => [],
    disabled: false,
    readonlyExistingOptions: false,
});

/** When readonlyExistingOptions became true, we lock options at index < this count. */
const initialLockedCount = ref<number | null>(null);

watch(
    () => props.readonlyExistingOptions,
    (readonly) => {
        if (readonly && initialLockedCount.value === null) {
            initialLockedCount.value = props.modelValue?.length ?? 0;
        }
        if (!readonly) {
            initialLockedCount.value = null;
        }
    },
    { immediate: true },
);

const emit = defineEmits<{
    'update:modelValue': [options: EventQuestionOption[]];
}>();

const options = computed({
    get: () => props.modelValue || [],
    set: val => emit('update:modelValue', val),
});

function isRowLocked(index: number): boolean {
    if (!props.readonlyExistingOptions || initialLockedCount.value === null) {
        return false;
    }
    return index < initialLockedCount.value;
}

const addOption = (): void => {
    if (props.disabled || options.value.length >= maxOptions) {
        return;
    }
    options.value = [...options.value, { label: '', value: '' }];
};

const removeOption = (index: number): void => {
    if (props.disabled || index < 0 || index >= options.value.length) {
        return;
    }
    if (props.readonlyExistingOptions && isRowLocked(index)) {
        return;
    }
    if (options.value.length > 1) {
        options.value = options.value.filter((_, i) => i !== index);
    }
};

const updateOption = (index: number, field: 'label' | 'value', value: string): void => {
    if (props.disabled || index < 0 || index >= options.value.length) {
        return;
    }
    if (props.readonlyExistingOptions && isRowLocked(index)) {
        return;
    }

    const updated: EventQuestionOption[] = [...options.value];
    const currentOption = updated[index];

    if (!currentOption) {
        return;
    }

    updated[index] = {
        ...currentOption,
        [field]: value,
    };

    // Value is derived from label: lowercase, spaces → underscore (snake_case), no special chars
    if (field === 'label') {
        updated[index]!.value = labelToOptionValue(value);
    }

    options.value = updated;
};

const optionCount = computed(() => options.value.length);
const maxOptions = 50;
</script>

<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">
                {{ t('event.questions.form.options') }}
            </Label>
            <span class="text-xs text-muted-foreground">
                {{ optionCount }} / {{ maxOptions }}
            </span>
        </div>

        <div class="space-y-1.5">
            <div
                v-for="(option, index) in options"
                :key="index"
                class="flex items-start gap-2 p-2 border rounded-md bg-muted/30"
            >
                <div class="flex-1 grid grid-cols-2 gap-2">
                    <FormItemInput
                        :id="`option-${index}-label`"
                        v-model="options[index].label"
                        :title="t('event.questions.form.option_n_label', { n: index + 1 })"
                        :placeholder="t('event.questions.form.enter_option_label')"
                        :required="true"
                        :disabled="disabled"
                        :readonly="isRowLocked(index)"
                        class="col-span-1"
                        @update:model-value="(val) => updateOption(index, 'label', String(val || ''))"
                    />
                    <FormItemInput
                        :id="`option-${index}-value`"
                        :model-value="options[index].value"
                        :title="t('event.questions.form.option_n_value', { n: index + 1 })"
                        :placeholder="t('event.questions.form.derived_from_label')"
                        :disabled="true"
                        class="col-span-1"
                    />
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="disabled || (readonlyExistingOptions && isRowLocked(index)) || options.length <= 1"
                    class="shrink-0 h-7 w-7 mt-6"
                    @click="removeOption(index)"
                >
                    <Icon
                        name="solar:trash-bin-minimalistic-outline"
                        class="size-4 text-destructive shrink-0"
                    />
                </Button>
            </div>
        </div>

        <Button
            type="button"
            variant="outline"
            size="sm"
            :disabled="disabled || optionCount >= maxOptions"
            class="w-full"
            @click="addOption"
        >
            <Icon
                name="solar:add-circle-outline"
                class="mr-2 size-4 shrink-0"
            />
            {{ t('event.questions.form.add_option') }}
        </Button>

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

        <p
            v-if="optionCount === 0"
            class="text-xs text-muted-foreground"
        >
            {{ t('event.questions.form.at_least_one_option') }}
        </p>
    </div>
</template>

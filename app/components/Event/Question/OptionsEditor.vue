<script setup lang="ts">
import type { EventQuestionOption } from '~/types/event-question';

type Props = {
    modelValue: EventQuestionOption[];
    errors?: string[];
    disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    errors: () => [],
    disabled: false,
});

const emit = defineEmits<{
    'update:modelValue': [options: EventQuestionOption[]];
}>();

const options = computed({
    get: () => props.modelValue || [],
    set: val => emit('update:modelValue', val),
});

const addOption = (): void => {
    if (options.value.length >= maxOptions) {
        return;
    }
    options.value = [...options.value, { label: '', value: '' }];
};

const removeOption = (index: number): void => {
    if (index < 0 || index >= options.value.length) {
        return;
    }
    if (options.value.length > 1) {
        options.value = options.value.filter((_, i) => i !== index);
    }
};

const updateOption = (index: number, field: 'label' | 'value', value: string): void => {
    if (index < 0 || index >= options.value.length) {
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

    // Auto-fill value from label if value is empty
    if (field === 'label' && !updated[index]!.value) {
        updated[index]!.value = value;
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
                Options
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
                        :title="`Option ${index + 1} Label`"
                        placeholder="Enter option label"
                        :required="true"
                        :disabled="disabled"
                        class="col-span-1"
                        @update:model-value="(val) => updateOption(index, 'label', String(val || ''))"
                    />
                    <FormItemInput
                        :id="`option-${index}-value`"
                        v-model="options[index].value"
                        :title="`Option ${index + 1} Value`"
                        placeholder="Enter option value (optional)"
                        :disabled="disabled"
                        class="col-span-1"
                        @update:model-value="(val) => updateOption(index, 'value', String(val || ''))"
                    />
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="disabled || options.length <= 1"
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
            Add Option
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
            At least one option is required for this question type.
        </p>
    </div>
</template>

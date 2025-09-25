<script setup lang="ts">
const props = withDefaults(defineProps<{
    id?: string;
    title?: string;
    placeholder?: string;
    modelValue?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    rows?: number;
    errors?: string[];
}>(), {
    disabled: false,
    readonly: false,
    required: false,
    rows: 4,
    errors: () => [],
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const textareaValue = computed<string>({
    get: () => props.modelValue ?? '',
    set: val => emit('update:modelValue', val),
});

const hasErrors = computed(() => props.errors && props.errors.length > 0);
</script>

<template>
    <div class="grid w-full items-center gap-1.5">
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
        <Textarea
            :id="id"
            v-model="textareaValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :rows="rows"
            :class="{
                'border-destructive focus-visible:ring-destructive dark:focus-visible:ring-destructive/40': hasErrors,
            }"
        />
        <div
            v-if="hasErrors"
            class="text-sm text-destructive"
        >
            <p
                v-for="error in errors"
                :key="error"
            >
                {{ error }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
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
}>(), {
    disabled: false,
    required: false,
    errors: () => [],
    trueLabel: 'On',
    falseLabel: 'Off',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const switchValue = computed<boolean>({
    get: () => props.modelValue ?? false,
    set: val => emit('update:modelValue', val),
});
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
        <div class="flex items-center space-x-2">
            <Switch
                :id="id"
                v-model="switchValue"
                v-bind="$attrs"
                :disabled="disabled"
                :aria-invalid="errors.length > 0"
            />
            <Label
                v-if="trueLabel || falseLabel"
                :for="id"
                class="text-sm text-muted-foreground"
            >
                {{ switchValue ? trueLabel : falseLabel }}
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

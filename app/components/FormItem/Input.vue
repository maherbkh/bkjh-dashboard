<script setup lang="ts">
const props = withDefaults(defineProps<{
    id?: string;
    title?: string;
    placeholder?: string;
    icon?: string;
    modelValue?: string;
    type?: string;
    disabled?: boolean;
    useShowPassword?: boolean;
    readonly?: boolean;
    required?: boolean;
    autocomplete?: string;
    rows?: number;
    errors?: string[];
}>(), {
    disabled: false,
    readonly: false,
    required: false,
    useShowPassword: false,
    autocomplete: 'off',
    rows: 4,
    errors: () => [],
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const inputValue = computed<string>({
    get: () => props.modelValue ?? '',
    set: val => emit('update:modelValue', val),
});
const showPassword = ref(false);
</script>

<template>
    <div class="grid w-full items-center gap-2">
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
        <div class="relative w-full items-center">
            <Input
                v-if="type !== 'textarea'"
                :id="id"
                v-model="inputValue"
                :type="useShowPassword ? (showPassword ? 'text' : (type || 'password')) : (type || 'text')"
                :placeholder="placeholder"
                :class="[(icon && 'pl-8')]"
                v-bind="$attrs"
                :disabled="disabled"
                :readonly="readonly"
                :aria-invalid="errors.length > 0"
                :autocomplete="autocomplete"
            />
            <Textarea
                v-else
                :id="id"
                v-model="inputValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :readonly="readonly"
                :aria-invalid="errors.length > 0"
                :class="{
                    'border-destructive focus-visible:ring-destructive': errors.length > 0,
                }"
                v-bind="{ rows }"
            />
            <span
                v-if="icon"
                class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
            >
                <Icon
                    :name="icon"
                    class="size-6 text-muted-foreground"
                />
            </span>
            <Button
                v-if="useShowPassword"
                type="button"
                variant="ghost"
                size="icon"
                class="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent !rounded-full"
                :disabled="props?.disabled"
                @click="showPassword = !showPassword"
            >
                <Icon
                    v-if="showPassword"
                    name="i-lucide-eye"
                    class="size-4 shrink-0"
                    aria-hidden="true"
                />
                <Icon
                    v-else
                    name="i-lucide-eye-off"
                    class="shrink-0 size-4"
                    aria-hidden="true"
                />
                <span class="sr-only">
                    {{ showPassword ? "Show password" : "Hide password" }}
                </span>
            </Button>
        </div>
        <div
            v-if="errors.length"
            class="text-destructive text-xs mt-0.5"
        >
            <div
                v-for="(err, i) in errors"
                :key="i"
                :class="[(icon && 'pl-8')]"
            >
                - {{ err }}
            </div>
        </div>
    </div>
</template>

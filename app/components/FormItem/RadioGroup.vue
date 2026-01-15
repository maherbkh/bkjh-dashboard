<script setup lang="ts" generic="T extends string | number = string | number">
import { cn } from '@/lib/utils';

type RadioOption<T = string | number> = {
    value: T;
    label: string;
    description?: string;
    disabled?: boolean;
    icon?: string;
};

type Props<T = string | number> = {
    id?: string;
    modelValue?: T | null;
    title?: string;
    description?: string;
    errors?: string[];
    required?: boolean;
    disabled?: boolean;
    class?: string;
    options: RadioOption<T>[];
    variant?: 'default' | 'box';
    orientation?: 'vertical' | 'horizontal';
};

const props = withDefaults(defineProps<Props<T>>(), {
    id: '',
    modelValue: null,
    title: '',
    description: '',
    errors: () => [],
    required: false,
    disabled: false,
    class: '',
    variant: 'default',
    orientation: 'vertical',
});

const emit = defineEmits<{
    'update:modelValue': [value: T | null];
}>();

const selectedValue = computed<T | null>({
    get: () => props.modelValue ?? null,
    set: val => emit('update:modelValue', val),
});

const hasErrors = computed(() => props.errors && props.errors.length > 0);
</script>

<template>
    <div :class="cn('grid w-full items-center gap-2', props.class)">
        <!-- Label with required indicator -->
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

        <!-- Optional description -->
        <p
            v-if="description"
            class="text-xs text-muted-foreground -mt-1"
        >
            {{ description }}
        </p>

        <!-- Radio Group (variant-specific rendering) -->
        <RadioGroup
            v-model="selectedValue"
            :disabled="disabled"
            :class="cn(
                orientation === 'horizontal' ? 'flex flex-row flex-wrap gap-4' : 'grid gap-3',
                hasErrors && 'aria-invalid',
            )"
        >
            <!-- Default variant: Standard radio buttons -->
            <template v-if="variant === 'default'">
                <div
                    v-for="option in options"
                    :key="String(option.value)"
                    class="flex items-center space-x-2"
                >
                    <RadioGroupItem
                        :id="`${id}-${option.value}`"
                        :value="option.value"
                        :disabled="option.disabled || disabled"
                        :aria-invalid="hasErrors"
                    />
                    <Label
                        :for="`${id}-${option.value}`"
                        class="font-normal cursor-pointer flex items-center gap-2"
                    >
                        <Icon
                            v-if="option.icon"
                            :name="option.icon"
                            class="h-4 w-4"
                        />
                        <span>{{ option.label }}</span>
                        <span
                            v-if="option.description"
                            class="text-xs text-muted-foreground"
                        >
                            - {{ option.description }}
                        </span>
                    </Label>
                </div>
            </template>

            <!-- Box variant: Card-style selection -->
            <template v-else>
                <Label
                    v-for="option in options"
                    :key="String(option.value)"
                    :for="`${id}-${option.value}`"
                    class="relative cursor-pointer block"
                >
                    <RadioGroupItem
                        :id="`${id}-${option.value}`"
                        :value="option.value"
                        :disabled="option.disabled || disabled"
                        :aria-invalid="hasErrors"
                        class="sr-only peer"
                    />
                    <div
                        :class="cn(
                            'rounded-lg border-2 p-4 transition-all',
                            'hover:border-primary/50 hover:shadow-sm',
                            'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md',
                            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                            'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                            hasErrors && 'border-destructive peer-data-[state=checked]:border-destructive',
                        )"
                    >
                        <div class="flex items-start gap-3">
                            <!-- Icon (optional) do not change style of the icon -->
                            <Icon
                                v-if="option.icon"
                                :name="option.icon"
                                class="size-6! shrink-0 mt-0.5"
                            />

                            <div class="flex-1 min-w-0">
                                <!-- Title -->
                                <div class="font-medium text-sm">
                                    {{ option.label }}
                                </div>

                                <!-- Description (optional) -->
                                <p
                                    v-if="option.description"
                                    class="text-xs font-light text-muted-foreground mt-1"
                                >
                                    {{ option.description }}
                                </p>
                            </div>

                            <!-- Check indicator -->
                            <Icon
                                name="solar:check-circle-bold"
                                class="h-5 w-5 text-primary opacity-0 shrink-0 peer-data-[state=checked]:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </Label>
            </template>
        </RadioGroup>

        <!-- Error messages -->
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

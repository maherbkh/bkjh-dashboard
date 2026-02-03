<script setup lang="ts">
import type { EventQuestionRatingConfig } from '~/types/event-question';
import { cn } from '@/lib/utils';

type Props = {
    id?: string;
    modelValue?: number | null;
    title?: string;
    description?: string;
    config?: EventQuestionRatingConfig;
    errors?: string[];
    required?: boolean;
    disabled?: boolean;
    class?: string;
};

const props = withDefaults(defineProps<Props>(), {
    id: '',
    modelValue: null,
    title: '',
    description: '',
    config: () => ({
        min: 0,
        max: 5,
        step: 1,
    }),
    errors: () => [],
    required: false,
    disabled: false,
    class: '',
});

const emit = defineEmits<{
    'update:modelValue': [value: number | null];
}>();

const ratingValue = computed<number>({
    get: () => {
        if (props.modelValue === null || props.modelValue === undefined) {
            return props.config?.min ?? 0;
        }
        return props.modelValue;
    },
    set: (val) => {
        const numVal = Number(val);
        if (!isNaN(numVal)) {
            emit('update:modelValue', numVal);
        }
        else {
            emit('update:modelValue', null);
        }
    },
});

const min = computed(() => props.config?.min ?? 0);
const max = computed(() => props.config?.max ?? 5);
const step = computed(() => props.config?.step ?? 1);
const minLabel = computed(() => props.config?.labels?.min);
const maxLabel = computed(() => props.config?.labels?.max);

const hasErrors = computed(() => props.errors && props.errors.length > 0);

// Generate array of values for display
const ratingValues = computed(() => {
    const values: number[] = [];
    for (let i = min.value; i <= max.value; i += step.value) {
        values.push(i);
    }
    return values;
});
</script>

<template>
    <div :class="cn('grid w-full items-center gap-2', props.class)">
        <!-- Label -->
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

        <!-- Description -->
        <p
            v-if="description"
            class="text-xs text-muted-foreground -mt-1"
        >
            {{ description }}
        </p>

        <!-- Rating Slider Container -->
        <div class="space-y-3">
            <!-- Slider Input -->
            <div class="relative flex items-center gap-4">
                <!-- Min Label -->
                <span
                    v-if="minLabel"
                    class="text-xs text-muted-foreground min-w-[60px] text-left"
                >
                    {{ minLabel }}
                </span>

                <!-- Range Input -->
                <div class="flex-1 relative">
                    <input
                        :id="id"
                        v-model.number="ratingValue"
                        type="range"
                        :min="min"
                        :max="max"
                        :step="step"
                        :disabled="disabled"
                        :class="cn(
                            'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
                            'accent-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            hasErrors && 'ring-2 ring-destructive ring-offset-2',
                        )"
                        :style="{
                            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((ratingValue - min) / (max - min)) * 100}%, hsl(var(--muted)) ${((ratingValue - min) / (max - min)) * 100}%, hsl(var(--muted)) 100%)`,
                        }"
                    >
                </div>

                <!-- Max Label -->
                <span
                    v-if="maxLabel"
                    class="text-xs text-muted-foreground min-w-[60px] text-right"
                >
                    {{ maxLabel }}
                </span>
            </div>

            <!-- Value Display and Labels Row -->
            <div class="flex items-center justify-between text-xs">
                <!-- Min value -->
                <span class="text-muted-foreground">
                    {{ min }}
                </span>

                <!-- Current Value Display -->
                <div class="flex items-center gap-2">
                    <span class="font-medium text-foreground">
                        {{ ratingValue }}
                    </span>
                    <span class="text-muted-foreground">
                        / {{ max }}
                    </span>
                </div>

                <!-- Max value -->
                <span class="text-muted-foreground">
                    {{ max }}
                </span>
            </div>

            <!-- Optional: Discrete Value Buttons (for smaller ranges) -->
            <div
                v-if="ratingValues.length <= 10"
                class="flex items-center justify-center gap-2 flex-wrap"
            >
                <Button
                    v-for="value in ratingValues"
                    :key="value"
                    type="button"
                    :variant="ratingValue === value ? 'default' : 'outline'"
                    size="sm"
                    :disabled="disabled"
                    class="min-w-[40px]"
                    @click="ratingValue = value"
                >
                    {{ value }}
                </Button>
            </div>
        </div>

        <!-- Error Messages -->
        <div
            v-if="hasErrors"
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

<style scoped>
/* Custom range input styling for webkit browsers */
input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    border: 2px solid hsl(var(--background));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(1.05);
}

input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    border: 2px solid hsl(var(--background));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

input[type="range"]::-moz-range-thumb:active {
    transform: scale(1.05);
}

input[type="range"]::-ms-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    border: 2px solid hsl(var(--background));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]:disabled::-webkit-slider-thumb,
input[type="range"]:disabled::-moz-range-thumb,
input[type="range"]:disabled::-ms-thumb {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

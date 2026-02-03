<script setup lang="ts">
interface Step {
    id: number;
    label: string;
}

interface Props {
    steps: Step[];
    modelValue: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: number];
}>();

const currentStep = computed({
    get: () => props.modelValue,
    set: (value: number) => emit('update:modelValue', value),
});

function goToStep(index: number) {
    if (index >= 0 && index < props.steps.length) {
        currentStep.value = index;
    }
}
</script>

<template>
    <nav
        class="w-full"
        aria-label="Form steps"
    >
        <!-- Vertical layout: < lg (stacked menu tabs, circle left, gap-4, title right, vertical lines between) -->
        <ol class="flex flex-col lg:hidden">
            <li
                v-for="(step, index) in steps"
                :key="`v-${step.id}`"
                class="flex items-center gap-4"
            >
                <button
                    type="button"
                    class="grid w-full cursor-pointer grid-cols-[auto_1fr] items-center gap-x-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    :aria-current="index === modelValue ? 'step' : undefined"
                    :aria-label="step.label"
                    @click="goToStep(index)"
                >
                    <span
                        class="flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                        :class="[
                            index === modelValue
                                ? 'border-primary bg-primary text-primary-foreground'
                                : index < modelValue
                                    ? 'ring-2 ring-primary/25 ring-offset-2 border-transparent bg-primary/5 text-primary'
                                    : 'border-muted-foreground/40 bg-muted/50 text-muted-foreground',
                        ]"
                    >
                        <Icon
                            v-if="index < modelValue"
                            name="solar:check-circle-outline"
                            class="size-5!"
                        />
                        <span
                            v-else
                            class="text-sm font-medium"
                        >{{ index + 1 }}</span>
                    </span>
                    <span
                        class="flex min-h-9 items-center py-2 text-left text-sm font-medium"
                        :class="[
                            index === modelValue ? 'text-primary' : 'text-muted-foreground',
                        ]"
                    >
                        {{ step.label }}
                    </span>
                    <template v-if="index < steps.length - 1">
                        <span
                            class="my-2 w-0.5 min-h-4 rounded transition-colors justify-self-center"
                            :class="
                                index < modelValue ? 'bg-primary' : 'bg-muted'
                            "
                            aria-hidden="true"
                        />
                        <span />
                    </template>
                </button>
            </li>
        </ol>

        <!-- Horizontal layout: lg+ -->
        <ol class="hidden w-full flex-nowrap items-stretch gap-0 min-w-0 lg:flex">
            <li
                v-for="(step, index) in steps"
                :key="`h-${step.id}`"
                class="flex min-w-0 flex-1 items-start"
            >
                <button
                    type="button"
                    class="flex min-w-0 flex-1 flex-col items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-1 transition-colors"
                    :class="[
                        index === modelValue
                            ? 'text-primary'
                            : index < modelValue
                                ? 'text-muted-foreground hover:text-foreground'
                                : 'text-muted-foreground',
                    ]"
                    :aria-current="index === modelValue ? 'step' : undefined"
                    :aria-label="step.label"
                    @click="goToStep(index)"
                >
                    <span
                        class="flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors"
                        :class="[
                            index === modelValue
                                ? 'border-primary bg-primary text-primary-foreground'
                                : index < modelValue
                                    ? 'ring-2 ring-primary/25 ring-offset-2 border-transparent bg-primary/5 text-primary'
                                    : 'border-muted-foreground/40 bg-muted/50',
                        ]"
                    >
                        <Icon
                            v-if="index < modelValue"
                            name="solar:check-circle-outline"
                            class="size-6!"
                        />
                        <span v-else>{{ index + 1 }}</span>
                    </span>
                    <span
                        class="line-clamp-2 min-h-[2.5rem] w-full px-0.5 text-center text-xs font-medium"
                        :class="[
                            index === modelValue ? 'text-primary' : 'text-muted-foreground',
                        ]"
                    >
                        {{ step.label }}
                    </span>
                </button>
                <span
                    v-if="index < steps.length - 1"
                    class="mt-[1.3125rem] h-0.5 w-12 shrink-0 rounded transition-colors"
                    :class="
                        index < modelValue ? 'bg-primary' : 'bg-muted'
                    "
                    aria-hidden="true"
                />
            </li>
        </ol>
    </nav>
</template>

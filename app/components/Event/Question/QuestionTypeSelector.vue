<script setup lang="ts">
import type { EventQuestionType } from '~/types/event-question';
import { EventQuestionType as QuestionType } from '~/types/event-question';

const { t } = useI18n();

type Props = {
    modelValue?: boolean;
    disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    disabled: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'select': [type: EventQuestionType];
}>();

const open = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
    open.value = val;
});

watch(open, (val) => {
    emit('update:modelValue', val);
});

const questionTypes = [
    {
        type: QuestionType.SHORT_TEXT,
        label: 'Short Text',
        description: 'Single-line text input',
        icon: 'solar:text-field-line-duotone',
    },
    {
        type: QuestionType.LONG_TEXT,
        label: 'Long Text',
        description: 'Multi-line text input',
        icon: 'solar:text-bold-line-duotone',
    },
    {
        type: QuestionType.SINGLE_CHOICE,
        label: 'Single Choice',
        description: 'Radio button selection',
        icon: 'solar:check-circle-line-duotone',
    },
    {
        type: QuestionType.MULTI_CHOICE,
        label: 'Multiple Choice',
        description: 'Checkbox selection',
        icon: 'solar:checklist-minimalistic-line-duotone',
    },
    {
        type: QuestionType.DROPDOWN,
        label: 'Dropdown',
        description: 'Dropdown selection',
        icon: 'solar:list-arrow-down-minimalistic-line-duotone',
    },
    {
        type: QuestionType.RATING,
        label: 'Rating',
        description: 'Rating scale',
        icon: 'solar:star-line-duotone',
    },
    {
        type: QuestionType.DATE,
        label: 'Date',
        description: 'Date picker',
        icon: 'solar:calendar-line-duotone',
    },
];

const handleSelect = (type: EventQuestionType) => {
    emit('select', type);
    open.value = false;
};
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button
                type="button"
                :disabled="disabled"
                class="gap-2"
            >
                <Icon
                    name="solar:add-circle-bold-duotone"
                    class="size-4 shrink-0"
                />
                Add Question
            </Button>
        </PopoverTrigger>
        <PopoverContent
            class="w-[360px] p-0"
            align="end"
        >
            <div class="p-1.5">
                <div class="px-2 py-1 mb-1">
                    <h4 class="text-sm font-semibold text-foreground">
                        Select Question Type
                    </h4>
                    <p class="text-xs text-muted-foreground">
                        Choose the type of question you want to add
                    </p>
                </div>
                <div class="grid grid-cols-1 gap-0.5">
                    <button
                        v-for="item in questionTypes"
                        :key="item.type"
                        type="button"
                        class="group flex items-center gap-2 rounded-md px-2 py-1.5 text-left border border-transparent hover:border-primary/20 hover:bg-accent/50 transition-all duration-200"
                        @click="handleSelect(item.type)"
                    >
                        <Icon
                            :name="item.icon"
                            class="size-4 text-primary shrink-0 group-hover:scale-110 transition-transform"
                        />
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                {{ item.label }}
                            </div>
                            <div class="text-xs text-muted-foreground">
                                {{ item.description }}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>

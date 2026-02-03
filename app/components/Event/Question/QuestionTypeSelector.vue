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

const questionTypes = computed(() => [
    { type: QuestionType.SHORT_TEXT, labelKey: 'event.questions.types.short_text', descKey: 'event.questions.types.short_text_desc', icon: 'solar:text-field-line-duotone' },
    { type: QuestionType.LONG_TEXT, labelKey: 'event.questions.types.long_text', descKey: 'event.questions.types.long_text_desc', icon: 'solar:text-bold-line-duotone' },
    { type: QuestionType.SINGLE_CHOICE, labelKey: 'event.questions.types.single_choice', descKey: 'event.questions.types.single_choice_desc', icon: 'solar:check-circle-line-duotone' },
    { type: QuestionType.MULTI_CHOICE, labelKey: 'event.questions.types.multi_choice', descKey: 'event.questions.types.multi_choice_desc', icon: 'solar:checklist-minimalistic-line-duotone' },
    { type: QuestionType.DROPDOWN, labelKey: 'event.questions.types.dropdown', descKey: 'event.questions.types.dropdown_desc', icon: 'solar:list-arrow-down-minimalistic-line-duotone' },
    { type: QuestionType.RATING, labelKey: 'event.questions.types.rating', descKey: 'event.questions.types.rating_desc', icon: 'solar:star-line-duotone' },
    { type: QuestionType.DATE, labelKey: 'event.questions.types.date', descKey: 'event.questions.types.date_desc', icon: 'solar:calendar-line-duotone' },
]);

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
                {{ t('event.questions.add_question') }}
            </Button>
        </PopoverTrigger>
        <PopoverContent
            class="w-[360px] p-0"
            align="end"
        >
            <div class="p-1.5">
                <div class="px-2 py-1 mb-1">
                    <h4 class="text-sm font-semibold text-foreground">
                        {{ t('event.questions.select_question_type') }}
                    </h4>
                    <p class="text-xs text-muted-foreground">
                        {{ t('event.questions.select_question_type_description') }}
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
                                {{ t(item.labelKey) }}
                            </div>
                            <div class="text-xs text-muted-foreground">
                                {{ t(item.descKey) }}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>

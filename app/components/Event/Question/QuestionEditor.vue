<script setup lang="ts">
import type { EventQuestion, EventQuestionType } from '~/types/event-question';
import { EventQuestionType as QuestionType, isChoiceQuestionType, requiresRatingConfig } from '~/types/event-question';
import { checkTypeChangeCompatibility } from '~/composables/useEventQuestions';
import { useAlertDialog } from '~/composables/useAlertDialog';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import OptionsEditor from './OptionsEditor.vue';
import RatingConfigEditor from './RatingConfigEditor.vue';

type Props = {
    question: EventQuestion;
    index: number;
    errors?: string[];
    disabled?: boolean;
    suggestedPosition?: number;
};

const props = withDefaults(defineProps<Props>(), {
    errors: () => [],
    disabled: false,
});

const emit = defineEmits<{
    'update:question': [question: EventQuestion];
    'remove': [];
}>();

const { show } = useAlertDialog();
const { t } = useI18n();

const isExpanded = ref(false);
const localQuestion = ref<EventQuestion>({ ...props.question });

watch(() => props.question, (newQuestion) => {
    localQuestion.value = { ...newQuestion };
}, { deep: true });

const updateField = <K extends keyof EventQuestion>(
    field: K,
    value: EventQuestion[K],
): void => {
    localQuestion.value = {
        ...localQuestion.value,
        [field]: value,
    };
    emit('update:question', { ...localQuestion.value });
};

const handleTypeChange = async (newType: EventQuestionType): Promise<void> => {
    if (newType === localQuestion.value.type) {
        return;
    }

    const compatibility = checkTypeChangeCompatibility(localQuestion.value.type, newType);

    if (!compatibility.compatible) {
        const confirmed = await show({
            title: 'Change Question Type?',
            description: compatibility.warning || 'Changing the question type may result in data loss. Are you sure you want to continue?',
            confirmText: 'Continue',
            cancelText: 'Cancel',
        });

        if (!confirmed) {
            // Reset type selector to original value
            await nextTick();
            return;
        }

        // Clear incompatible data
        if (isChoiceQuestionType(localQuestion.value.type) && !isChoiceQuestionType(newType)) {
            localQuestion.value.options = undefined;
        }
        if (localQuestion.value.type === QuestionType.RATING && newType !== QuestionType.RATING) {
            localQuestion.value.config = undefined;
        }
        if (!isChoiceQuestionType(localQuestion.value.type) && isChoiceQuestionType(newType)) {
            localQuestion.value.options = [];
        }
        if (localQuestion.value.type !== QuestionType.RATING && newType === QuestionType.RATING) {
            localQuestion.value.config = {
                min: 0,
                max: 5,
                step: 1,
            };
        }
    }

    updateField('type', newType);
};

const handleRemove = async (): Promise<void> => {
    const confirmed = await show({
        title: 'Delete Question?',
        description: 'Are you sure you want to delete this question? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
    });

    if (confirmed) {
        emit('remove');
    }
};

const questionTypeOptions = [
    { id: QuestionType.SHORT_TEXT, name: 'Short Text' },
    { id: QuestionType.LONG_TEXT, name: 'Long Text' },
    { id: QuestionType.SINGLE_CHOICE, name: 'Single Choice' },
    { id: QuestionType.MULTI_CHOICE, name: 'Multiple Choice' },
    { id: QuestionType.DROPDOWN, name: 'Dropdown' },
    { id: QuestionType.RATING, name: 'Rating' },
    { id: QuestionType.DATE, name: 'Date' },
];

const getTypeIcon = (type: EventQuestionType) => {
    const icons: Record<EventQuestionType, string> = {
        [QuestionType.SHORT_TEXT]: 'solar:text-field-line-duotone',
        [QuestionType.LONG_TEXT]: 'solar:text-bold-line-duotone',
        [QuestionType.SINGLE_CHOICE]: 'solar:check-circle-line-duotone',
        [QuestionType.MULTI_CHOICE]: 'solar:checklist-minimalistic-line-duotone',
        [QuestionType.DROPDOWN]: 'solar:list-arrow-down-minimalistic-line-duotone',
        [QuestionType.RATING]: 'solar:star-line-duotone',
        [QuestionType.DATE]: 'solar:calendar-line-duotone',
    };
    return icons[type] || 'solar:question-circle-line-duotone';
};
</script>

<template>
    <div
        class="border rounded-lg bg-background transition-all duration-200"
        :class="{
            'border-primary/20': isExpanded,
            'border-destructive/50': errors && errors.length > 0,
            'border-border': !isExpanded && (!errors || errors.length === 0),
        }"
    >
        <!-- Header Row - Clickable to expand/collapse -->
        <div
            class="grid lg:grid-cols-12 gap-2 py-2 px-3 cursor-pointer hover:bg-muted/30 transition-colors"
            @click="isExpanded = !isExpanded"
        >
            <!-- Question Title/Label (col-span-4) -->
            <div class="col-span-12 lg:col-span-4 flex items-center gap-2 min-w-0">
                <Icon
                    :name="getTypeIcon(localQuestion.type)"
                    class="size-5! text-primary shrink-0"
                />
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-foreground truncate">
                        {{ localQuestion.label || `Question ${index + 1}` }}
                    </div>
                    <div
                        v-if="localQuestion.isRequired"
                        class="text-xs text-muted-foreground"
                    >
                        Required
                    </div>
                </div>
            </div>

            <!-- Type Badge (col-span-2) -->
            <div class="col-span-6 lg:col-span-2 flex items-center justify-center">
                <Badge
                    variant="secondary"
                    class="text-xs py-0.5"
                >
                    {{ questionTypeOptions.find(opt => opt.id === localQuestion.type)?.name }}
                </Badge>
            </div>

            <!-- Position (col-span-2) -->
            <div class="col-span-6 lg:col-span-2 flex items-center justify-center">
                <span
                    v-if="localQuestion.position !== undefined"
                    class="text-xs text-muted-foreground"
                >
                    {{ localQuestion.position }}
                </span>
                <span
                    v-else
                    class="text-xs text-muted-foreground/50"
                >
                    —
                </span>
            </div>

            <!-- Errors (col-span-2) -->
            <div class="col-span-6 lg:col-span-2 flex items-center justify-center">
                <Badge
                    v-if="errors && errors.length > 0"
                    variant="destructive"
                    class="text-xs py-0.5"
                >
                    <Icon
                        name="solar:danger-triangle-line-duotone"
                        class="size-3! mr-1 shrink-0"
                    />
                    {{ errors.length }}
                </Badge>
                <span
                    v-else
                    class="text-xs text-muted-foreground/50"
                >
                    —
                </span>
            </div>

            <!-- Actions (col-span-2) -->
            <div class="col-span-12 lg:col-span-2 flex items-center justify-end gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="disabled"
                    class="h-7 w-7"
                    @click.stop="isExpanded = !isExpanded"
                >
                    <Icon
                        :name="isExpanded ? 'solar:arrow-up-outline' : 'solar:alt-arrow-down-outline'"
                        class="size-4! shrink-0"
                    />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="disabled"
                    class="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    @click.stop="handleRemove"
                >
                    <Icon
                        name="solar:trash-bin-minimalistic-outline"
                        class="size-4! shrink-0"
                    />
                </Button>
            </div>
        </div>

        <!-- Form Content - Collapsible -->
        <Collapsible v-model:open="isExpanded">
            <CollapsibleContent>
                <div class="space-y-3 pt-3 px-3 pb-3 border-t">
                    <!-- Question ID (read-only for existing questions) -->
                    <div
                        v-if="localQuestion.id"
                        class="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md"
                    >
                        <Icon
                            name="solar:tag-outline"
                            class="size-3.5! shrink-0"
                        />
                        <span class="font-mono">ID: {{ localQuestion.id }}</span>
                    </div>

                    <!-- Label -->
                    <FormItemInput
                        id="question-label"
                        v-model="localQuestion.label"
                        :title="'Question Label'"
                        :placeholder="'Enter question label'"
                        :required="true"
                        :disabled="disabled"
                        :errors="errors?.filter(e => e.includes('Label')) || []"
                        @update:model-value="(val) => updateField('label', String(val || ''))"
                    />

                    <!-- Type Selector -->
                    <FormItemSelect
                        id="question-type"
                        v-model="localQuestion.type"
                        :title="'Question Type'"
                        :data="questionTypeOptions"
                        key-value="id"
                        name-value="name"
                        :required="true"
                        :disabled="disabled"
                        @update:model-value="(val) => handleTypeChange(val as EventQuestionType)"
                    />

                    <!-- Is Required -->
                    <FormItemSwitch
                        id="question-required"
                        v-model="localQuestion.isRequired"
                        :title="'Required'"
                        true-label="Yes"
                        false-label="No"
                        :disabled="disabled"
                        @update:model-value="(val) => updateField('isRequired', Boolean(val))"
                    />

                    <!-- Position -->
                    <FormItemInput
                        id="question-position"
                        :model-value="localQuestion.position !== undefined ? String(localQuestion.position) : ''"
                        type="number"
                        :title="'Position'"
                        :placeholder="suggestedPosition !== undefined ? String(suggestedPosition) : 'Enter position'"
                        :required="true"
                        :disabled="disabled"
                        :min="0"
                        :errors="errors?.filter(e => e.includes('Position')) || []"
                        @update:model-value="(val) => updateField('position', val ? Number(val) : undefined)"
                    />
                    <p class="text-xs text-muted-foreground -mt-2">
                        Set position for sorting (must be unique)
                    </p>

                    <!-- Placeholder -->
                    <FormItemInput
                        id="question-placeholder"
                        v-model="localQuestion.placeholder"
                        :title="'Placeholder'"
                        :placeholder="'Enter placeholder text (optional)'"
                        :disabled="disabled"
                        @update:model-value="(val) => updateField('placeholder', val ? String(val) : undefined)"
                    />

                    <!-- Help Text -->
                    <FormItemTextarea
                        id="question-help-text"
                        v-model="localQuestion.helpText"
                        :title="'Help Text'"
                        :placeholder="'Enter help text (optional)'"
                        :disabled="disabled"
                        :rows="3"
                        @update:model-value="(val) => updateField('helpText', val ? String(val) : undefined)"
                    />

                    <!-- Options Editor (for choice types) -->
                    <div
                        v-if="isChoiceQuestionType(localQuestion.type)"
                        class="pt-2 border-t"
                    >
                        <OptionsEditor
                            :model-value="localQuestion.options || []"
                            :errors="errors?.filter(e => e.includes('option') || e.includes('Option')) || []"
                            :disabled="disabled"
                            @update:model-value="(val) => updateField('options', val)"
                        />
                    </div>

                    <!-- Rating Config Editor (for rating type) -->
                    <div
                        v-if="requiresRatingConfig(localQuestion.type)"
                        class="pt-2 border-t"
                    >
                        <RatingConfigEditor
                            v-model="localQuestion.config"
                            :errors="errors?.filter(e => e.includes('rating') || e.includes('Rating') || e.includes('config')) || []"
                            :disabled="disabled"
                            @update:model-value="(val) => updateField('config', val)"
                        />
                    </div>

                    <!-- General Errors -->
                    <div
                        v-if="errors && errors.length > 0"
                        class="text-destructive text-xs space-y-0.5"
                    >
                        <div
                            v-for="(err, i) in errors.filter(e => !e.includes('Label') && !e.includes('Position') && !e.includes('option') && !e.includes('Option') && !e.includes('rating') && !e.includes('Rating') && !e.includes('config'))"
                            :key="i"
                        >
                            • {{ err }}
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    </div>
</template>

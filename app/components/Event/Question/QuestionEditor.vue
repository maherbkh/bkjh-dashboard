<script setup lang="ts">
import type { EventQuestion, EventQuestionType } from '~/types/event-question';
import type { QuestionValidationMessage } from '~/composables/useEventQuestions';
import { EventQuestionType as QuestionType, isChoiceQuestionType } from '~/types/event-question';
import { checkTypeChangeCompatibility } from '~/composables/useEventQuestions';
import { useAlertDialog } from '~/composables/useAlertDialog';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import OptionsEditor from './OptionsEditor.vue';

type Props = {
    question: EventQuestion;
    index: number;
    errors?: QuestionValidationMessage[];
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

function toMessage(msg: QuestionValidationMessage): string {
    return typeof msg === 'string' ? t(msg) : t(msg.key, msg.params as Record<string, string>);
}

function errorKey(msg: QuestionValidationMessage): string {
    return typeof msg === 'string' ? msg : msg.key;
}

const generalErrors = computed(() => {
    if (!props.errors?.length) return [];
    return props.errors
        .filter((e) => {
            const k = errorKey(e);
            return !k.includes('label') && !k.includes('position') && !k.toLowerCase().includes('option');
        })
        .map(toMessage);
});

/** When true, only isRequired, position, and helpText are editable (question has answers). */
const lockedByAnswers = computed(() => props.question?.hasAnswers === true);

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
        const description = compatibility.warningMessages?.length
            ? compatibility.warningMessages.map(m => toMessage(m)).join('. ') + '.'
            : t('event.questions.dialogs.change_type_description');
        const confirmed = await show({
            title: t('event.questions.dialogs.change_type_title'),
            description,
            confirmText: t('event.questions.dialogs.continue_confirm'),
            cancelText: t('event.questions.dialogs.cancel'),
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
        if (!isChoiceQuestionType(localQuestion.value.type) && isChoiceQuestionType(newType)) {
            localQuestion.value.options = [];
        }
    }

    updateField('type', newType);
};

const handleRemove = async (): Promise<void> => {
    const confirmed = await show({
        title: t('event.questions.dialogs.delete_title'),
        description: t('event.questions.dialogs.delete_description_this'),
        confirmText: t('event.questions.dialogs.delete_confirm'),
        cancelText: t('event.questions.dialogs.cancel'),
    });

    if (confirmed) {
        emit('remove');
    }
};

const questionTypeOptions = computed(() => [
    { id: QuestionType.SHORT_TEXT, name: t('event.questions.types.short_text') },
    { id: QuestionType.LONG_TEXT, name: t('event.questions.types.long_text') },
    { id: QuestionType.SINGLE_CHOICE, name: t('event.questions.types.single_choice') },
    { id: QuestionType.MULTI_CHOICE, name: t('event.questions.types.multi_choice') },
    { id: QuestionType.DROPDOWN, name: t('event.questions.types.dropdown') },
    { id: QuestionType.DATE, name: t('event.questions.types.date') },
]);

const getTypeIcon = (type: EventQuestionType) => {
    const icons: Record<EventQuestionType, string> = {
        [QuestionType.SHORT_TEXT]: 'solar:text-field-line-duotone',
        [QuestionType.LONG_TEXT]: 'solar:text-bold-line-duotone',
        [QuestionType.SINGLE_CHOICE]: 'solar:check-circle-line-duotone',
        [QuestionType.MULTI_CHOICE]: 'solar:checklist-minimalistic-line-duotone',
        [QuestionType.DROPDOWN]: 'solar:list-arrow-down-minimalistic-line-duotone',
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
                        {{ localQuestion.label || t('event.questions.form.question_n', { n: index + 1 }) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                        {{ localQuestion.isRequired ? t('event.questions.form.required') : t('event.questions.form.optional') }}
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
                    :disabled="disabled || lockedByAnswers"
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

                    <!-- Label (readonly when question has answers) -->
                    <FormItemInput
                        id="question-label"
                        v-model="localQuestion.label"
                        :title="t('event.questions.form.question_label')"
                        :placeholder="t('event.questions.form.question_label_placeholder')"
                        :required="true"
                        :disabled="disabled || lockedByAnswers"
                        :errors="errors?.filter(e => errorKey(e).includes('label'))?.map(toMessage) || []"
                        @update:model-value="(val) => updateField('label', String(val || ''))"
                    />

                    <!-- Type Selector (readonly when question has answers) -->
                    <FormItemSelect
                        id="question-type"
                        v-model="localQuestion.type"
                        :title="t('event.questions.form.question_type')"
                        :data="questionTypeOptions"
                        key-value="id"
                        name-value="name"
                        :required="true"
                        :disabled="disabled || lockedByAnswers"
                        @update:model-value="(val) => handleTypeChange(val as EventQuestionType)"
                    />

                    <!-- Is Required (always editable when not disabled) -->
                    <FormItemSwitch
                        id="question-required"
                        v-model="localQuestion.isRequired"
                        :title="t('event.questions.form.required')"
                        :true-label="t('common.yes')"
                        :false-label="t('common.no')"
                        :disabled="disabled"
                        @update:model-value="(val) => updateField('isRequired', Boolean(val))"
                    />

                    <!-- Position (always editable when not disabled) -->
                    <FormItemInput
                        id="question-position"
                        :model-value="localQuestion.position !== undefined ? String(localQuestion.position) : ''"
                        type="number"
                        :title="t('event.questions.form.position')"
                        :placeholder="suggestedPosition !== undefined ? String(suggestedPosition) : t('event.questions.form.position_placeholder')"
                        :required="true"
                        :disabled="disabled"
                        :min="0"
                        :errors="errors?.filter(e => errorKey(e).includes('position'))?.map(toMessage) || []"
                        @update:model-value="(val) => updateField('position', val ? Number(val) : undefined)"
                    />
                    <p class="text-xs text-muted-foreground -mt-2">
                        {{ t('event.questions.form.position_hint') }}
                    </p>

                    <!-- Placeholder (readonly when question has answers) -->
                    <FormItemInput
                        id="question-placeholder"
                        v-model="localQuestion.placeholder"
                        :title="t('event.questions.form.placeholder')"
                        :placeholder="t('event.questions.form.placeholder_optional')"
                        :disabled="disabled || lockedByAnswers"
                        @update:model-value="(val) => updateField('placeholder', val ? String(val) : undefined)"
                    />

                    <!-- Help Text (always editable when not disabled) -->
                    <FormItemTextarea
                        id="question-help-text"
                        v-model="localQuestion.helpText"
                        :title="t('event.questions.form.help_text')"
                        :placeholder="t('event.questions.form.help_text_optional')"
                        :disabled="disabled"
                        :rows="3"
                        @update:model-value="(val) => updateField('helpText', val ? String(val) : undefined)"
                    />

                    <!-- Options Editor (readonly when question has answers) -->
                    <div
                        v-if="isChoiceQuestionType(localQuestion.type)"
                        class="pt-2 border-t"
                    >
                        <OptionsEditor
                            :model-value="localQuestion.options || []"
                            :errors="errors?.filter(e => errorKey(e).toLowerCase().includes('option'))?.map(toMessage) || []"
                            :disabled="disabled"
                            :readonly-existing-options="lockedByAnswers"
                            @update:model-value="(val) => updateField('options', val)"
                        />
                    </div>

                    <!-- General Errors -->
                    <div
                        v-if="generalErrors.length > 0"
                        class="text-destructive text-xs space-y-0.5"
                    >
                        <div
                            v-for="(msg, i) in generalErrors"
                            :key="i"
                        >
                            • {{ msg }}
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    </div>
</template>

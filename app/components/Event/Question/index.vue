<script setup lang="ts">
import type { EventQuestion, EventQuestionType } from '~/types/event-question';
import type { QuestionValidationMessage } from '~/composables/useEventQuestions';
import { EventQuestionType as QuestionType } from '~/types/event-question';
import {
    getDefaultQuestion,
    validateQuestion,
    validatePositionUniqueness,
    getNextAvailablePosition,
    prepareQuestionsForSubmit,
} from '~/composables/useEventQuestions';
import { useAlertDialog } from '~/composables/useAlertDialog';
import QuestionEditor from './QuestionEditor.vue';
import QuestionTypeSelector from './QuestionTypeSelector.vue';

const { t } = useI18n();

function toMessage(msg: QuestionValidationMessage): string {
    return typeof msg === 'string' ? t(msg) : t(msg.key, msg.params as Record<string, string>);
}

type Props = {
    modelValue?: EventQuestion[];
    errors?: Record<string, string[]>;
    disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    errors: () => ({}),
    disabled: false,
});

const emit = defineEmits<{
    'update:modelValue': [questions: EventQuestion[]];
    'add:question': [question: EventQuestion];
    'remove:question': [questionId: string];
    'update:question': [question: EventQuestion];
}>();

const { show } = useAlertDialog();

const questions = computed({
    get: () => props.modelValue || [],
    set: val => emit('update:modelValue', val),
});

const addQuestion = (type: EventQuestionType): void => {
    const newQuestion = getDefaultQuestion(type, questions.value.length + 1);

    questions.value = [...questions.value, newQuestion];
    emit('add:question', newQuestion);
};

const removeQuestion = async (index: number) => {
    const question = questions.value[index];
    if (!question) return;

    const description = question.label
        ? t('event.questions.dialogs.delete_description', { label: question.label })
        : t('event.questions.dialogs.delete_description_this');

    const confirmed = await show({
        title: t('event.questions.dialogs.delete_title'),
        description,
        confirmText: t('event.questions.dialogs.delete_confirm'),
        cancelText: t('event.questions.dialogs.cancel'),
    });

    if (confirmed) {
        questions.value = questions.value.filter((_, i) => i !== index);
        emit('remove:question', question.id ?? `index-${index}`);
    }
};

const updateQuestion = (index: number, updatedQuestion: EventQuestion): void => {
    if (index < 0 || index >= questions.value.length) {
        return;
    }

    const updated: EventQuestion[] = [...questions.value];
    updated[index] = updatedQuestion;
    questions.value = updated;
    emit('update:question', updatedQuestion);
};

const duplicateQuestion = (index: number): void => {
    if (index < 0 || index >= questions.value.length) {
        return;
    }

    const question = questions.value[index];
    if (!question) {
        return;
    }

    const duplicated: EventQuestion = {
        ...getDefaultQuestion(question.type, questions.value.length + 1),
        label: `${question.label} ${t('event.questions.form.copy_suffix')}`,
        type: question.type,
        isRequired: question.isRequired,
        placeholder: question.placeholder,
        helpText: question.helpText,
        options: question.options ? [...question.options] : undefined,
        config: question.config ? { ...question.config } : undefined,
    };

    questions.value = [...questions.value, duplicated];
};

// Validate all questions (errors are i18n keys/params for translation in template)
const questionErrors = computed(() => {
    const errors: Record<number, QuestionValidationMessage[]> = {};

    questions.value.forEach((question, index) => {
        const validationErrors = validateQuestion(question);
        if (validationErrors.length > 0) {
            errors[index] = validationErrors;
        }
    });

    const positionErrors = validatePositionUniqueness(questions.value);
    if (positionErrors.length > 0) {
        questions.value.forEach((question, index) => {
            if (question.position !== undefined) {
                if (!errors[index]) {
                    errors[index] = [];
                }
                positionErrors.forEach((err) => {
                    const pos = typeof err === 'string' ? null : err.params?.position;
                    if (pos === question.position && errors[index]) {
                        errors[index]!.push(err);
                    }
                });
            }
        });
    }

    return errors;
});

const suggestedPosition = computed(() => getNextAvailablePosition(questions.value));
</script>

<template>
    <div class="space-y-4">
        <!-- Empty State -->
        <div
            v-if="questions.length === 0"
            class="flex flex-col items-center justify-center py-6 px-3 border border-dashed rounded-lg"
        >
            <div class="relative mb-3">
                <div class="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
                <Icon
                    name="solar:question-circle-line-duotone"
                    class="relative size-10 text-primary shrink-0"
                />
            </div>
            <h4 class="text-sm font-semibold text-foreground mb-1">
                {{ t('event.questions.empty_title') }}
            </h4>
            <p class="text-xs text-muted-foreground text-center max-w-md mb-3">
                {{ t('event.questions.empty_description') }}
            </p>
            <QuestionTypeSelector
                :disabled="disabled"
                @select="addQuestion"
            />
        </div>

        <!-- Questions List -->
        <div
            v-else
            class="space-y-3"
        >
            <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>
                    {{ questions.length }} {{ questions.length === 1 ? t('event.questions.question') : t('event.questions.questions') }}
                </span>
                <span v-if="questionErrors && Object.keys(questionErrors).length > 0">
                    {{ Object.keys(questionErrors).length }} {{ Object.keys(questionErrors).length === 1 ? t('event.questions.error') : t('event.questions.errors') }} {{ t('event.questions.errors_to_fix') }}
                </span>
            </div>

            <div class="space-y-2">
                <QuestionEditor
                    v-for="(question, index) in questions"
                    :key="index"
                    :question="question"
                    :index="index"
                    :errors="questionErrors[index] || []"
                    :disabled="disabled"
                    :suggested-position="suggestedPosition"
                    @update:question="(updated) => updateQuestion(index, updated)"
                    @remove="() => removeQuestion(index)"
                />
            </div>

            <!-- Add Another Question -->
            <div class="pt-1">
                <QuestionTypeSelector
                    :disabled="disabled"
                    @select="addQuestion"
                />
            </div>
        </div>

        <!-- Global Errors -->
        <Alert
            v-if="Object.keys(errors).length > 0 && Object.keys(errors).some(key => key.startsWith('questions'))"
            variant="destructive"
            class="border-destructive/50"
        >
            <Icon
                name="solar:danger-triangle-line-duotone"
                class="size-4 shrink-0"
            />
            <AlertTitle>{{ t('event.questions.validation_errors_title') }}</AlertTitle>
            <AlertDescription>
                <div class="space-y-1 mt-2">
                    <div
                        v-for="(errs, key) in errors"
                        :key="key"
                    >
                        <div
                            v-for="(err, i) in errs"
                            :key="i"
                            class="text-sm"
                        >
                            • {{ err }}
                        </div>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    </div>
</template>

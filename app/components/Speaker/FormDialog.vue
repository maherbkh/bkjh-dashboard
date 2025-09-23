<template>
    <Dialog
        :open="isDialogOpen"
        @update:open="(value) => emit('update:isDialogOpen', value)"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                    {{ dialogMode === "add" ? $t("action.add") : $t("action.edit") }}
                    {{ $t("speaker.singular") }}
                </DialogTitle>
                <DialogDescription>
                    {{
                        dialogMode === "add"
                            ? $t("speaker.add_description")
                            : $t("speaker.edit_description")
                    }}
                </DialogDescription>
            </DialogHeader>

            <form
                class="space-y-4"
                @submit.prevent="handleSubmit"
            >
                <div class="space-y-2">
                    <Label for="name">{{ $t("global.name") }}</Label>
                    <FormItemInput
                        id="name"
                        v-model="name"
                        :placeholder="$t('speaker.name_placeholder')"
                        :error="errors.name"
                        required
                        maxlength="100"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="qualification">{{ $t("speaker.qualification") }}</Label>
                    <FormItemTextarea
                        id="qualification"
                        v-model="qualification"
                        :placeholder="$t('speaker.qualification_placeholder')"
                        :error="errors.qualification"
                        maxlength="500"
                        rows="3"
                    />
                    <p class="text-xs text-muted-foreground">
                        {{ $t("speaker.qualification_help") }}
                    </p>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                        <FormItemSwitch
                            id="isActive"
                            v-model="isActive"
                            :error="errors.isActive"
                        />
                        <Label for="isActive">{{ $t("common.active") }}</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="isSubmitting"
                        @click="handleClose"
                    >
                        {{ $t("action.cancel") }}
                    </Button>
                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                    >
                        <Icon
                            v-if="isSubmitting"
                            name="solar:spinner-linear"
                            class="animate-spin"
                        />
                        {{
                            dialogMode === "add"
                                ? $t("action.add")
                                : $t("action.save_changes")
                        }}
                    </Button>
                    <Button
                        v-if="dialogMode === 'add'"
                        type="button"
                        :disabled="isSubmitting"
                        @click="handleSubmitAndAddNew"
                    >
                        <Icon
                            v-if="isSubmitting"
                            name="solar:spinner-linear"
                            class="animate-spin"
                        />
                        {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { Speaker, SpeakerForm } from '~/types';
import { createSpeakerSchema } from '~/composables/speakerSchema';

const { t } = useI18n();

// Props
const props = defineProps<{
    isDialogOpen: boolean;
    dialogMode: 'add' | 'edit';
    editingSpeaker: Speaker | null;
    isSubmitting: boolean;
}>();

// Emits
const emit = defineEmits<{
    'update:isDialogOpen': [value: boolean];
    'update:dialogMode': [value: 'add' | 'edit'];
    'update:editingSpeaker': [value: Speaker | null];
    'submit-and-close': [values: SpeakerForm];
    'submit-and-add-new': [values: SpeakerForm];
    'close-dialog': [];
}>();

// CRUD operations for form validation
const {
    defineField,
    handleSubmit: handleFormSubmit,
    errors,
    resetForm,
    setValues,
} = useCrud<Speaker, SpeakerForm>({
    crudPath: 'speakers',
    tenant: 'academy',
    formSchema: createSpeakerSchema(t),
});

// Form fields
const [name] = defineField('name');
const [qualification] = defineField('qualification');
const [isActive] = defineField('isActive');

// Watch for editing speaker changes
watch(
    () => props.editingSpeaker,
    (speaker) => {
        if (speaker) {
            setValues({
                name: speaker.name,
                qualification: speaker.qualification,
                isActive: speaker.isActive,
            });
        }
    },
    { immediate: true },
);

// Watch for dialog mode changes
watch(
    () => props.dialogMode,
    (mode) => {
        if (mode === 'add') {
            resetForm();
        }
    },
);

// Form submission handlers
const handleSubmit = handleFormSubmit((values) => {
    emit('submit-and-close', values);
});

const handleSubmitAndAddNew = handleFormSubmit((values) => {
    emit('submit-and-add-new', values);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

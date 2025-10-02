<script setup lang="ts">
import type { MediaFile } from '~/types/media';

interface Props {
    isDialogOpen: boolean;
    dialogMode: 'add' | 'edit';
    editingMedia: MediaFile | null;
    isSubmitting: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:isDialogOpen', value: boolean): void;
    (e: 'update:dialogMode', value: 'add' | 'edit'): void;
    (e: 'update:editingMedia', value: MediaFile | null): void;
    (e: 'submitAndClose', values: any): void;
    (e: 'submitAndAddNew', values: any): void;
    (e: 'closeDialog'): void;
}>();

const { t } = useI18n();

// Form state
const form = ref({
    title: '',
    description: '',
    altText: '',
    accessLevel: 'PUBLIC' as 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC',
});

// Watch for editing media changes
watch(() => props.editingMedia, (newMedia) => {
    if (newMedia) {
        form.value = {
            title: newMedia.title || '',
            description: newMedia.description || '',
            altText: newMedia.altText || '',
            accessLevel: newMedia.accessLevel || 'PUBLIC',
        };
    } else {
        resetForm();
    }
}, { immediate: true });

const resetForm = () => {
    form.value = {
        title: '',
        description: '',
        altText: '',
        accessLevel: 'PUBLIC',
    };
};

const handleSubmitAndClose = () => {
    emit('submitAndClose', { ...form.value });
};

const handleSubmitAndAddNew = () => {
    emit('submitAndAddNew', { ...form.value });
};

const handleClose = () => {
    emit('closeDialog');
};

const dialogOpen = computed({
    get: () => props.isDialogOpen,
    set: (value) => emit('update:isDialogOpen', value),
});

const dialogMode = computed({
    get: () => props.dialogMode,
    set: (value) => emit('update:dialogMode', value),
});

const editingMedia = computed({
    get: () => props.editingMedia,
    set: (value) => emit('update:editingMedia', value),
});
</script>

<template>
    <Dialog v-model:open="dialogOpen" @update:open="dialogOpen = $event">
        <DialogContent class="!max-w-none !w-[1400px]">
            <DialogHeader>
                <DialogTitle>
                    {{ dialogMode === 'add' ? t('media.add_metadata') : t('media.edit_metadata') }}
                </DialogTitle>
                <DialogDescription>
                    {{ dialogMode === 'add' 
                        ? t('media.add_metadata_description') 
                        : t('media.edit_metadata_description') 
                    }}
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-6 py-4">
                <!-- Title -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                        {{ t('media.title') }}
                    </label>
                    <FormItemInput
                        v-model="form.title"
                        :placeholder="t('media.title_placeholder')"
                        class="w-full"
                    />
                </div>

                <!-- Description -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                        {{ t('media.description') }}
                    </label>
                    <FormItemTextarea
                        v-model="form.description"
                        :placeholder="t('media.description_placeholder')"
                        class="w-full"
                        :rows="3"
                    />
                </div>

                <!-- Alt Text -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                        {{ t('media.alt_text') }}
                    </label>
                    <FormItemInput
                        v-model="form.altText"
                        :placeholder="t('media.alt_text_placeholder')"
                        class="w-full"
                    />
                </div>

                <!-- Access Level -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                        {{ t('media.access_level') }}
                    </label>
                    <FormItemSelect
                        v-model="form.accessLevel"
                        :options="[
                            { value: 'PUBLIC', label: t('media.access_public') },
                            { value: 'SELF', label: t('media.access_self') },
                            { value: 'SUPPORT', label: t('media.access_support') },
                            { value: 'ACADEMY', label: t('media.access_academy') },
                        ]"
                        class="w-full"
                    />
                </div>
            </div>

            <DialogFooter class="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="handleClose"
                >
                    <Icon name="solar:close-circle-outline" class="w-4 h-4 mr-2" />
                    {{ t('common.cancel') }}
                </Button>
                <div class="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        :disabled="isSubmitting"
                        @click="handleSubmitAndAddNew"
                    >
                        <Icon name="solar:add-circle-outline" class="w-4 h-4 mr-2" />
                        {{ t('common.save_and_add_new') }}
                    </Button>
                    <Button
                        type="button"
                        :disabled="isSubmitting"
                        @click="handleSubmitAndClose"
                    >
                        <Icon name="solar:check-circle-outline" class="w-4 h-4 mr-2" />
                        {{ t('common.save_and_close') }}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

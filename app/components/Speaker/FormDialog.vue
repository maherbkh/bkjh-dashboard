<template>
    <Dialog
        :open="isDialogOpen"
        @update:open="(value) => emit('update:isDialogOpen', value)"
    >
        <DialogContent class="sm:max-w-2xl">
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
                        :errors="errors.name ? [errors.name] : []"
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
                        :errors="errors.qualification ? [errors.qualification] : []"
                        maxlength="500"
                        :rows="3"
                    />
                    <p class="text-xs text-muted-foreground">
                        {{ $t("speaker.qualification_help") }}
                    </p>
                </div>

                <div class="grid lg:grid-cols-2 gap-4 items-start">
                    <div class="flex flex-col w-full">
                        <FormItemMedia
                            id="avatar"
                            v-model="avatarMedia"
                            :label="$t('speaker.avatar') || 'Avatar'"
                            name="avatar"
                            :multiple="false"
                            :max-files="1"
                            :allowed-types="['image']"
                            :access-level="AccessLevel.PUBLIC"
                            :collection-name="CollectionType.AVATAR"
                            :errors="errors.avatar ? [errors.avatar] : []"
                        />
                    </div>

                    <div class="flex flex-col w-full">
                        <FormItemMedia
                            id="logo"
                            v-model="logoMedia"
                            :label="$t('speaker.logo') || 'Logo'"
                            name="logo"
                            :multiple="false"
                            :max-files="1"
                            :allowed-types="['image']"
                            :access-level="AccessLevel.PUBLIC"
                            :collection-name="CollectionType.COVER"
                            :errors="errors.logo ? [errors.logo] : []"
                            :logo="true"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                        <FormItemSwitch
                            id="isActive"
                            v-model="isActive"
                            :errors="errors.isActive ? [errors.isActive] : []"
                        />
                        <Label for="isActive">{{ isActive ? $t("common.active") : $t("common.inactive") }}</Label>
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
import type { MediaEntity } from '~/types/media/index';
import { AccessLevel, CollectionType } from '~/types/media/index';
import { createSpeakerSchema } from '~/composables/speakerSchema';
import FormItemMedia from '~/components/FormItem/Media.vue';

const { t } = useI18n();

// Props
const props = defineProps<{
    isDialogOpen: boolean;
    dialogMode: 'add' | 'edit';
    editingSpeaker: Speaker | null;
    isSubmitting: boolean;
}>();

// Emits — call-signature form so overload resolution works for submit events
const emit = defineEmits<{
    (e: 'update:isDialogOpen', value: boolean): void;
    (e: 'update:dialogMode', value: 'add' | 'edit'): void;
    (e: 'update:editingSpeaker', value: Speaker | null): void;
    (e: 'submit-and-close' | 'submit-and-add-new', values: SpeakerForm): void;
    (e: 'close-dialog'): void;
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

// Avatar media field - stored as MediaEntity in component, but form schema expects ID
const avatarMedia = ref<MediaEntity | null>(null);
const avatarId = computed(() => avatarMedia.value?.id || null);

// Logo media field - stored as MediaEntity in component, but form schema expects ID
const logoMedia = ref<MediaEntity | null>(null);
const logoId = computed(() => logoMedia.value?.id || null);

// Watch for editing speaker changes
watch(
    () => props.editingSpeaker,
    async (speaker) => {
        if (speaker) {
            // Handle avatar media - could be ID string or MediaEntity object
            let avatarEntity: MediaEntity | null = null;
            const avatarData = (speaker as any).avatar;
            const avatarUrl = (speaker as any).avatarUrl;

            if (avatarData) {
                if (typeof avatarData === 'string') {
                    // If it's an ID, fetch the media entity
                    try {
                        const { data, error } = await useApiFetch<{ success: boolean; message: string; data: MediaEntity }>(`/shared/media/${avatarData}`, {
                            server: false,
                        });

                        if (error.value) {
                            console.error('Error fetching avatar media:', error.value);
                            // If fetch fails but we have avatarUrl, create a minimal entity
                            if (avatarUrl) {
                                avatarEntity = {
                                    id: avatarData,
                                    uuid: avatarData,
                                    filename: '',
                                    storedName: '',
                                    path: '',
                                    url: avatarUrl,
                                    mimeType: 'image/png',
                                    extension: '.png',
                                    size: 0,
                                    metadata: {},
                                    accessLevel: AccessLevel.PUBLIC,
                                } as MediaEntity;
                            }
                        }
                        else {
                            const response = data.value as { data?: MediaEntity } | null;
                            if (response?.data) {
                                avatarEntity = response.data;
                                if (avatarUrl && !avatarEntity.url) {
                                    avatarEntity = {
                                        ...avatarEntity,
                                        url: avatarUrl,
                                    } as MediaEntity;
                                }
                            }
                            else if (avatarUrl) {
                                avatarEntity = {
                                    id: avatarData,
                                    uuid: avatarData,
                                    filename: '',
                                    storedName: '',
                                    path: '',
                                    url: avatarUrl,
                                    mimeType: 'image/png',
                                    extension: '.png',
                                    size: 0,
                                    metadata: {},
                                    accessLevel: AccessLevel.PUBLIC,
                                } as MediaEntity;
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error fetching avatar media:', error);
                        if (avatarUrl) {
                            avatarEntity = {
                                id: avatarData,
                                uuid: avatarData,
                                filename: '',
                                storedName: '',
                                path: '',
                                url: avatarUrl,
                                mimeType: 'image/png',
                                extension: '.png',
                                size: 0,
                                metadata: {},
                                accessLevel: AccessLevel.PUBLIC,
                            } as MediaEntity;
                        }
                    }
                }
                else if (avatarData.id) {
                    avatarEntity = avatarData as MediaEntity;
                }
            }
            else if (avatarUrl && typeof avatarUrl === 'string') {
                const urlParts = avatarUrl.split('/');
                const filename = urlParts[urlParts.length - 1] ?? '';
                const uuidMatch = filename.match(/^([a-f0-9-]+)/);
                const uuid = uuidMatch ? uuidMatch[1] : '';

                avatarEntity = {
                    id: uuid || '',
                    uuid: uuid || '',
                    filename: filename,
                    storedName: filename,
                    path: avatarUrl.replace('http://api.backhaus.local:3055/', ''),
                    url: avatarUrl,
                    mimeType: 'image/png',
                    extension: filename.split('.').pop() || '.png',
                    size: 0,
                    metadata: {},
                    accessLevel: AccessLevel.PUBLIC,
                } as MediaEntity;
            }

            await nextTick();
            if (avatarEntity) {
                const validEntity: MediaEntity = {
                    id: avatarEntity.id || '',
                    uuid: avatarEntity.uuid || avatarEntity.id || '',
                    filename: avatarEntity.filename || '',
                    storedName: avatarEntity.storedName || avatarEntity.filename || '',
                    path: avatarEntity.path || '',
                    url: avatarEntity.url || avatarUrl || '',
                    mimeType: avatarEntity.mimeType || 'image/png',
                    extension: avatarEntity.extension || '.png',
                    size: typeof avatarEntity.size === 'string' ? parseInt(avatarEntity.size) : (avatarEntity.size || 0),
                    metadata: avatarEntity.metadata || {},
                    accessLevel: avatarEntity.accessLevel || AccessLevel.PUBLIC,
                } as MediaEntity;
                avatarMedia.value = { ...validEntity };
            }
            else {
                avatarMedia.value = null;
            }

            // Handle logo media - could be ID string or MediaEntity object
            let logoEntity: MediaEntity | null = null;
            const logoData = (speaker as any).logo;
            const logoUrl = (speaker as any).logoUrl;

            if (logoData) {
                if (typeof logoData === 'string') {
                    // If it's an ID, fetch the media entity
                    try {
                        const { data, error } = await useApiFetch<{ success: boolean; message: string; data: MediaEntity }>(`/shared/media/${logoData}`, {
                            server: false,
                        });

                        if (error.value) {
                            console.error('Error fetching logo media:', error.value);
                            // If fetch fails but we have logoUrl, create a minimal entity
                            if (logoUrl) {
                                logoEntity = {
                                    id: logoData,
                                    uuid: logoData,
                                    filename: '',
                                    storedName: '',
                                    path: '',
                                    url: logoUrl,
                                    mimeType: 'image/png',
                                    extension: '.png',
                                    size: 0,
                                    metadata: {},
                                    accessLevel: AccessLevel.PUBLIC,
                                } as MediaEntity;
                            }
                        }
                        else {
                            const response = data.value as { data?: MediaEntity } | null;
                            if (response?.data) {
                                logoEntity = response.data;
                                if (logoUrl && !logoEntity.url) {
                                    logoEntity = {
                                        ...logoEntity,
                                        url: logoUrl,
                                    } as MediaEntity;
                                }
                            }
                            else if (logoUrl) {
                                logoEntity = {
                                    id: logoData,
                                    uuid: logoData,
                                    filename: '',
                                    storedName: '',
                                    path: '',
                                    url: logoUrl,
                                    mimeType: 'image/png',
                                    extension: '.png',
                                    size: 0,
                                    metadata: {},
                                    accessLevel: AccessLevel.PUBLIC,
                                } as MediaEntity;
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error fetching logo media:', error);
                        if (logoUrl) {
                            logoEntity = {
                                id: logoData,
                                uuid: logoData,
                                filename: '',
                                storedName: '',
                                path: '',
                                url: logoUrl,
                                mimeType: 'image/png',
                                extension: '.png',
                                size: 0,
                                metadata: {},
                                accessLevel: AccessLevel.PUBLIC,
                            } as MediaEntity;
                        }
                    }
                }
                else if (logoData.id) {
                    logoEntity = logoData as MediaEntity;
                }
            }
            else if (logoUrl && typeof logoUrl === 'string') {
                const urlParts = logoUrl.split('/');
                const filename = urlParts[urlParts.length - 1] ?? '';
                const uuidMatch = filename.match(/^([a-f0-9-]+)/);
                const uuid = uuidMatch ? uuidMatch[1] : '';

                logoEntity = {
                    id: uuid || '',
                    uuid: uuid || '',
                    filename: filename,
                    storedName: filename,
                    path: logoUrl.replace('http://api.backhaus.local:3055/', ''),
                    url: logoUrl,
                    mimeType: 'image/png',
                    extension: filename.split('.').pop() || '.png',
                    size: 0,
                    metadata: {},
                    accessLevel: AccessLevel.PUBLIC,
                } as MediaEntity;
            }

            await nextTick();
            if (logoEntity) {
                const validLogoEntity: MediaEntity = {
                    id: logoEntity.id || '',
                    uuid: logoEntity.uuid || logoEntity.id || '',
                    filename: logoEntity.filename || '',
                    storedName: logoEntity.storedName || logoEntity.filename || '',
                    path: logoEntity.path || '',
                    url: logoEntity.url || logoUrl || '',
                    mimeType: logoEntity.mimeType || 'image/png',
                    extension: logoEntity.extension || '.png',
                    size: typeof logoEntity.size === 'string' ? parseInt(logoEntity.size) : (logoEntity.size || 0),
                    metadata: logoEntity.metadata || {},
                    accessLevel: logoEntity.accessLevel || AccessLevel.PUBLIC,
                } as MediaEntity;
                logoMedia.value = { ...validLogoEntity };
            }
            else {
                logoMedia.value = null;
            }

            setValues({
                name: speaker.name,
                qualification: speaker.qualification,
                avatar: avatarEntity?.id || null,
                logo: logoEntity?.id || null,
                isActive: speaker.isActive,
            });
        }
    },
    { immediate: true },
);

const defaultSpeakerValues: SpeakerForm = {
    name: '',
    qualification: '',
    avatar: null,
    logo: null,
    isActive: true,
};

// Watch for dialog mode changes — reset with explicit values so errors clear (Zod v4 / vee-validate)
watch(
    () => props.dialogMode,
    (mode) => {
        if (mode === 'add') {
            nextTick(() => {
                resetForm({ values: defaultSpeakerValues });
            });
            avatarMedia.value = null;
            logoMedia.value = null;
        }
    },
);

// Clear form when dialog closes so errors don’t persist on next open
watch(
    () => props.isDialogOpen,
    (isOpen) => {
        if (!isOpen) {
            nextTick(() => {
                resetForm({ values: defaultSpeakerValues });
            });
            avatarMedia.value = null;
            logoMedia.value = null;
        }
    },
);

// Form submission handlers
const handleSubmit = handleFormSubmit((values) => {
    const submitValues = {
        ...values,
        avatar: avatarId.value,
        logo: logoId.value,
    };
    emit('submit-and-close', submitValues as SpeakerForm);
});

const handleSubmitAndAddNew = handleFormSubmit((values) => {
    const submitValues = {
        ...values,
        avatar: avatarId.value,
        logo: logoId.value,
    };
    emit('submit-and-add-new', submitValues as SpeakerForm);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

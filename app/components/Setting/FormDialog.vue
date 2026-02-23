<script setup lang="ts">
import type { Setting, SettingForm } from '~/types';
import type { MediaEntity } from '~/types/media/index';
import { createSettingSchema } from '~/composables/settingSchema';
import { SettingValueType, AppDomain } from '~/types/settings';
import { CollectionType as CollectionTypeEnum } from '~/types/media/index';
import FormItemMedia from '~/components/FormItem/Media.vue';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
    Setting,
    SettingForm
>({
    crudPath: 'settings',
    tenant: 'shared',
    formSchema: createSettingSchema(t),
});

const [key, keyAttrs] = defineField('key');
const [name, nameAttrs] = defineField('name');
const [description, descriptionAttrs] = defineField('description');
const [type, typeAttrs] = defineField('type');
const [value, valueAttrs] = defineField('value');
const [apps, appsAttrs] = defineField('apps');
const [isPublic, isPublicAttrs] = defineField('isPublic');
const [parentId, parentIdAttrs] = defineField('parentId');

// Uploader-specific fields (only used when type is UPLOADER)
const uploaderAlt = ref('');
const uploaderTitle = ref('');
const selectedMedia = ref<MediaEntity | null>(null);
const isLoadingMedia = ref(false);

// Available type options
const typeOptions = computed(() => [
    { id: SettingValueType.STRING, name: SettingValueType.STRING },
    { id: SettingValueType.NUMBER, name: SettingValueType.NUMBER },
    { id: SettingValueType.BOOLEAN, name: SettingValueType.BOOLEAN },
    { id: SettingValueType.JSON, name: SettingValueType.JSON },
    { id: SettingValueType.DATE, name: SettingValueType.DATE },
    { id: SettingValueType.ARRAY, name: SettingValueType.ARRAY },
    { id: SettingValueType.UPLOADER, name: SettingValueType.UPLOADER },
    { id: SettingValueType.SECTION, name: SettingValueType.SECTION },
]);

// Fetch sections for parentId select
const sections = ref<Array<{ id: string; name: string; type: string }>>([]);
const isLoadingSections = ref(false);

const fetchSections = async () => {
    isLoadingSections.value = true;
    try {
        const { data } = await useApiFetch<{ data: Array<{ id: string; name: string; type: string }> }>('/shared/settings/sections', {
            method: 'GET',
        });
        if (data.value?.data && Array.isArray(data.value.data)) {
            sections.value = data.value.data.map((section: { id: string; name: string; type: string }) => ({
                id: section.id,
                name: section.name,
                type: section.type,
            }));
        }
    }
    catch (error) {
        console.error('Error fetching sections:', error);
    }
    finally {
        isLoadingSections.value = false;
    }
};

// Fetch sections on mount
onMounted(() => {
    fetchSections();
});

// Parent options for select
const parentOptions = computed(() => {
    // Exclude current setting from parent options if editing
    const currentId = props.editingSetting?.id;
    return sections.value
        .filter(section => section.id !== currentId)
        .map(section => ({
            id: section.id,
            name: section.name,
        }));
});

// Available app domain options
const appDomainOptions = computed(() => [
    { id: AppDomain.DASHBOARD, name: AppDomain.DASHBOARD },
    { id: AppDomain.ACADEMY, name: AppDomain.ACADEMY },
    { id: AppDomain.SUPPORT, name: AppDomain.SUPPORT },
]);

type Props = {
    isDialogOpen: boolean;
    dialogMode?: 'add' | 'edit';
    editingSetting?: Setting | null;
    isSubmitting?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    editingSetting: null,
    dialogMode: 'add',
    isSubmitting: false,
});

const emit = defineEmits<{
    (e: 'update:is-dialog-open', value: boolean): void;
    (e: 'update:dialog-mode', value: 'add' | 'edit'): void;
    (e: 'update:editing-setting', value: Setting | null): void;
    (e: 'submit-and-close' | 'submit-and-add-new', values: SettingForm): void;
    (e: 'close-dialog'): void;
}>();

// Computed properties
const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('setting.singular')
        : t('action.edit') + ' ' + t('setting.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add' ? t('setting.add') || t('setting.singular') : t('setting.edit') || t('setting.singular');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:is-dialog-open', value),
});

// Value input handling based on type (excluding UPLOADER which is handled separately)
const valueInput = computed({
    get: () => {
        const currentType = type.value || SettingValueType.STRING;
        const currentValue = value.value;

        if (currentValue === null || currentValue === undefined) {
            return '';
        }

        switch (currentType) {
            case SettingValueType.JSON:
                return typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2);
            case SettingValueType.ARRAY:
                return Array.isArray(currentValue) ? JSON.stringify(currentValue) : '';
            case SettingValueType.DATE:
                return typeof currentValue === 'string' ? currentValue : '';
            case SettingValueType.BOOLEAN:
                return currentValue;
            case SettingValueType.NUMBER:
                return String(currentValue);
            case SettingValueType.SECTION:
                return '';
            case SettingValueType.STRING:
            default:
                return String(currentValue);
        }
    },
    set: (val: any) => {
        const currentType = type.value || SettingValueType.STRING;

        // Skip UPLOADER type as it's handled separately
        if (currentType === SettingValueType.UPLOADER) {
            return;
        }

        switch (currentType) {
            case SettingValueType.JSON:
                try {
                    // Try to parse as JSON
                    value.value = typeof val === 'string' ? JSON.parse(val) : val;
                }
                catch {
                    // If parsing fails, store as string
                    value.value = val;
                }
                break;
            case SettingValueType.ARRAY:
                try {
                    // Parse array from JSON string
                    value.value = typeof val === 'string' ? JSON.parse(val) : (Array.isArray(val) ? val : []);
                }
                catch {
                    value.value = [];
                }
                break;
            case SettingValueType.NUMBER:
                value.value = val === '' ? null : Number(val);
                break;
            case SettingValueType.BOOLEAN:
                value.value = Boolean(val);
                break;
            case SettingValueType.DATE:
                value.value = val;
                break;
            case SettingValueType.SECTION:
                // SECTION type doesn't need a value
                value.value = null;
                break;
            case SettingValueType.STRING:
            default:
                value.value = String(val);
                break;
        }
    },
});

// Fetch media by ID for uploader type
const fetchMediaById = async (mediaId: string | null) => {
    if (!mediaId) {
        selectedMedia.value = null;
        return;
    }

    isLoadingMedia.value = true;
    try {
        const { data } = await useApiFetch<{ success: boolean; message: string; data: MediaEntity }>(`/shared/media/${mediaId}`, {
            method: 'GET',
        });
        const response = data.value as unknown as { success?: boolean; message?: string; data?: MediaEntity } | null;
        if (response?.data) {
            selectedMedia.value = response.data;
        }
    }
    catch (error) {
        console.error('Error fetching media:', error);
        selectedMedia.value = null;
    }
    finally {
        isLoadingMedia.value = false;
    }
};

// Sync uploader fields with value object
const isSyncingValue = ref(false);
const syncUploaderValue = () => {
    if (type.value === SettingValueType.UPLOADER && !isSyncingValue.value) {
        isSyncingValue.value = true;
        value.value = {
            mediaId: selectedMedia.value?.id || null,
            alt: uploaderAlt.value || '',
            title: uploaderTitle.value || '',
            collection: 'default',
        };
        nextTick(() => {
            isSyncingValue.value = false;
        });
    }
};

// Watch uploader fields and sync with value
watch([uploaderAlt, uploaderTitle, selectedMedia], () => {
    if (type.value === SettingValueType.UPLOADER) {
        syncUploaderValue();
    }
}, { deep: true });

// Watch value changes to update uploader fields when editing
watch(() => value.value, (newValue) => {
    if (type.value === SettingValueType.UPLOADER && typeof newValue === 'object' && newValue !== null && !isSyncingValue.value) {
        const uploaderValue = newValue as { mediaId?: string | null; alt?: string; title?: string; collection?: string };

        // Only update if values are different to avoid loops
        if (uploaderAlt.value !== (uploaderValue.alt || '')) {
            uploaderAlt.value = uploaderValue.alt || '';
        }
        if (uploaderTitle.value !== (uploaderValue.title || '')) {
            uploaderTitle.value = uploaderValue.title || '';
        }

        // Fetch media if mediaId exists and is different
        const currentMediaId = selectedMedia.value?.id || null;
        if (uploaderValue.mediaId && uploaderValue.mediaId !== currentMediaId) {
            fetchMediaById(uploaderValue.mediaId);
        }
        else if (!uploaderValue.mediaId && currentMediaId) {
            selectedMedia.value = null;
        }
    }
}, { immediate: true, deep: true });

// Watch for type changes to reset value appropriately
watch(() => type.value, (newType, oldType) => {
    if (newType !== oldType && oldType !== undefined) {
        // Reset value when type changes
        switch (newType) {
            case SettingValueType.BOOLEAN:
                value.value = false;
                break;
            case SettingValueType.NUMBER:
                value.value = 0;
                break;
            case SettingValueType.JSON:
                value.value = {};
                break;
            case SettingValueType.ARRAY:
                value.value = [];
                break;
            case SettingValueType.UPLOADER:
                uploaderAlt.value = '';
                uploaderTitle.value = '';
                selectedMedia.value = null;
                value.value = { mediaId: null, alt: '', title: '', collection: 'default' };
                break;
            case SettingValueType.DATE:
                value.value = new Date().toISOString().split('T')[0];
                break;
            case SettingValueType.SECTION:
                value.value = null;
                break;
            case SettingValueType.STRING:
            default:
                value.value = '';
                break;
        }
    }
});

// Watchers
watch(
    () => props.editingSetting,
    (newSetting) => {
        if (newSetting && props.dialogMode === 'edit') {
            setValues({
                key: newSetting.key,
                name: newSetting.name,
                description: newSetting.description || null,
                type: newSetting.type,
                value: newSetting.value,
                apps: newSetting.apps || [],
                isPublic: newSetting.isPublic || false,
                parentId: newSetting.parentId || null,
            });
        }
    },
    { immediate: true },
);

watch(
    () => props.isDialogOpen,
    (isOpen) => {
        if (!isOpen) {
            resetForm();
            // Reset uploader fields when dialog closes
            uploaderAlt.value = '';
            uploaderTitle.value = '';
            selectedMedia.value = null;
        }
    },
);

// Watch for dialog mode changes to reset form when switching to add mode
watch(
    () => props.dialogMode,
    (newMode, oldMode) => {
        if (newMode === 'add' && (oldMode === 'edit' || oldMode === 'add')) {
            // Reset form when switching to add mode (submitAndAddNew scenario)
            nextTick(() => {
                resetForm({
                    values: {
                        key: '',
                        name: '',
                        description: null,
                        type: SettingValueType.STRING,
                        value: '',
                        apps: [],
                        isPublic: false,
                        parentId: null,
                    },
                });
            });
        }
    },
);

// Methods
const onSubmitAndClose = handleSubmit((values) => {
    emit('submit-and-close', values as SettingForm);
});

const onSubmitAndAddNew = handleSubmit((values) => {
    emit('submit-and-add-new', values as SettingForm);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-[1024px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader class="shrink-0">
                <DialogTitle>{{ dialogTitle }}</DialogTitle>
                <DialogDescription>
                    {{ dialogDescription }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex-1 overflow-y-auto overflow-x-hidden pr-1 no-scrollbar-arrows scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
                <form class="space-y-4">
                    <div class="grid md:grid-cols-12 gap-4">
                        <FormItemInput
                            id="key"
                            v-model="key"
                            class="md:col-span-12"
                            v-bind="keyAttrs"
                            :title="$t('setting.key') || 'Key'"
                            :placeholder="$t('setting.key_placeholder') || 'e.g., app.maintenance_mode'"
                            :errors="errors.key ? [errors.key] : []"
                            required
                        />

                        <FormItemInput
                            id="name"
                            v-model="name"
                            class="md:col-span-12"
                            v-bind="nameAttrs"
                            :title="$t('setting.name') || $t('global.name')"
                            :placeholder="$t('setting.name_placeholder') || 'Setting name'"
                            :errors="errors.name ? [errors.name] : []"
                            required
                        />

                        <FormItemTextarea
                            id="description"
                            v-model="description"
                            class="md:col-span-12"
                            v-bind="descriptionAttrs"
                            :title="$t('setting.description') || $t('common.description')"
                            :placeholder="$t('setting.description_placeholder') || 'Setting description'"
                            :errors="errors.description ? [errors.description] : []"
                            :rows="2"
                        />

                        <FormItemSelect
                            id="type"
                            v-model="type"
                            class="md:col-span-6"
                            v-bind="typeAttrs"
                            :title="$t('setting.type') || 'Type'"
                            :placeholder="$t('action.select') + ' ' + ($t('setting.type') || 'Type')"
                            :data="typeOptions"
                            key-value="id"
                            name-value="name"
                            :errors="errors.type ? [errors.type] : []"
                        />

                        <FormItemSelect
                            id="parentId"
                            v-model="parentId"
                            class="md:col-span-6"
                            v-bind="parentIdAttrs"
                            :title="$t('setting.parent') || 'Parent Section'"
                            :placeholder="$t('action.select') + ' ' + ($t('setting.parent') || 'Parent Section')"
                            :data="parentOptions"
                            key-value="id"
                            name-value="name"
                            :errors="errors.parentId ? [errors.parentId] : []"
                            :loading="isLoadingSections"
                        />

                        <FormItemMultiSelect
                            id="apps"
                            v-model="apps"
                            class="md:col-span-12"
                            v-bind="appsAttrs"
                            :title="$t('setting.apps') || $t('admin.apps')"
                            :data="appDomainOptions"
                            item-key="id"
                            item-label="name"
                            :placeholder="$t('action.select') + ' ' + ($t('setting.apps') || $t('admin.apps'))"
                            :errors="errors.apps ? [errors.apps] : []"
                        />

                        <!-- Value input based on type -->
                        <div class="md:col-span-12">
                            <FormItemInput
                                v-if="type === SettingValueType.STRING || !type"
                                id="value"
                                v-model="valueInput"
                                v-bind="valueAttrs"
                                :title="$t('setting.value') || 'Value'"
                                :placeholder="$t('setting.value_placeholder') || 'Enter value'"
                                :errors="errors.value ? [errors.value] : []"
                                required
                            />

                            <FormItemInput
                                v-else-if="type === SettingValueType.NUMBER"
                                id="value"
                                v-model="valueInput"
                                v-bind="valueAttrs"
                                type="number"
                                :title="$t('setting.value') || 'Value'"
                                :placeholder="$t('setting.value_placeholder') || 'Enter number'"
                                :errors="errors.value ? [errors.value] : []"
                                required
                            />

                            <FormItemSwitch
                                v-else-if="type === SettingValueType.BOOLEAN"
                                id="value"
                                v-model="valueInput"
                                v-bind="valueAttrs"
                                :title="$t('setting.value') || 'Value'"
                                :true-label="$t('common.true') || 'True'"
                                :false-label="$t('common.false') || 'False'"
                                :errors="errors.value ? [errors.value] : []"
                            />

                            <FormItemTextarea
                                v-else-if="type === SettingValueType.JSON"
                                id="value"
                                v-model="valueInput"
                                v-bind="valueAttrs"
                                :title="$t('setting.value') || 'Value'"
                                :placeholder="t('setting.value_json_placeholder') || 'Enter JSON'"
                                :errors="errors.value ? [errors.value] : []"
                                :rows="6"
                                required
                            />

                            <FormItemDatePicker
                                v-else-if="type === SettingValueType.DATE"
                                :model-value="valueInput"
                                v-bind="valueAttrs"
                                :label="$t('setting.value') || 'Value'"
                                :placeholder="$t('setting.value_date_placeholder') || 'Select date'"
                                :errors="errors.value ? [errors.value] : []"
                                :time-picker="false"
                                format="yyyy-MM-dd"
                                name="value"
                                required
                                @update:model-value="(val: string | Date) => valueInput = String(val)"
                            />

                            <FormItemTextarea
                                v-else-if="type === SettingValueType.ARRAY"
                                id="value"
                                v-model="valueInput"
                                v-bind="valueAttrs"
                                :title="$t('setting.value') || 'Value'"
                                :placeholder="t('setting.value_array_placeholder') || 'Enter array as JSON (e.g., [1, 2, 3])'"
                                :errors="errors.value ? [errors.value] : []"
                                :rows="4"
                                required
                            />

                            <!-- SECTION type doesn't need a value field -->
                            <div
                                v-else-if="type === SettingValueType.SECTION"
                                class="text-sm text-muted-foreground"
                            >
                                {{ $t('setting.section_no_value') || 'Section type does not require a value' }}
                            </div>
                        </div>

                        <!-- Uploader fields (only shown when type is UPLOADER) -->
                        <template v-if="type === SettingValueType.UPLOADER">
                            <FormItemInput
                                id="uploader-alt"
                                v-model="uploaderAlt"
                                class="md:col-span-12"
                                :title="$t('setting.alt') || 'Alt Text'"
                                :placeholder="$t('setting.alt_placeholder') || 'Enter alt text'"
                                :errors="[]"
                            />

                            <FormItemInput
                                id="uploader-title"
                                v-model="uploaderTitle"
                                class="md:col-span-12"
                                :title="$t('setting.title') || 'Title'"
                                :placeholder="$t('setting.title_placeholder') || 'Enter title'"
                                :errors="[]"
                            />

                            <div class="md:col-span-12">
                                <FormItemMedia
                                    id="uploader-media"
                                    v-model="selectedMedia"
                                    :label="$t('setting.media') || 'Media'"
                                    :collection-name="CollectionTypeEnum.DEFAULT"
                                    :multiple="false"
                                    :max-files="1"
                                    :errors="errors.value ? [errors.value] : []"
                                    show-manager
                                />
                            </div>
                        </template>

                        <FormItemSwitch
                            id="isPublic"
                            v-model="isPublic"
                            class="md:col-span-12"
                            v-bind="isPublicAttrs"
                            :title="$t('setting.public') || $t('common.public')"
                            :true-label="$t('common.public')"
                            :false-label="$t('common.private')"
                            :errors="errors.isPublic ? [errors.isPublic] : []"
                        />
                    </div>
                </form>
            </div>
            <DialogFooter class="shrink-0 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    @click="handleClose"
                >
                    {{ $t('action.cancel') }}
                </Button>
                <Button
                    v-if="dialogMode === 'add'"
                    type="button"
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="onSubmitAndAddNew"
                >
                    <Icon
                        v-if="isSubmitting"
                        name="solar:refresh-outline"
                        class="animate-spin mr-2 h-4 w-4"
                    />
                    {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
                </Button>
                <Button
                    type="button"
                    :disabled="isSubmitting"
                    @click="onSubmitAndClose"
                >
                    <Icon
                        v-if="isSubmitting"
                        name="solar:refresh-outline"
                        class="animate-spin mr-2 h-4 w-4"
                    />
                    {{ dialogMode === 'add' ? $t('action.save') : $t('action.update') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

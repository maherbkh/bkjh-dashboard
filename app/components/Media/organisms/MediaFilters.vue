<script setup lang="ts">
import { AccessLevel, CollectionType, SortField, SortDirection } from '~/types/media/index';
import FormItemInput from '~/components/FormItem/Input.vue';
import FormItemSelect from '~/components/FormItem/Select.vue';
import { Button } from '@/components/ui/button';
import { Icon } from '#components';

interface Props {
    searchQuery: string;
    accessLevel: AccessLevel | null;
    collectionName: CollectionType | null;
    mimeType: string | null;
    sortBy: SortField;
    sortDir: SortDirection;
    showAdvanced?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    showAdvanced: false,
    class: '',
});

const emit = defineEmits<{
    'update:searchQuery': [value: string];
    'update:accessLevel': [value: AccessLevel | null];
    'update:collectionName': [value: CollectionType | null];
    'update:mimeType': [value: string | null];
    'update:sortBy': [value: SortField];
    'update:sortDir': [value: SortDirection];
    'search': [];
    'reset': [];
}>();

const { t } = useI18n();

// Computed properties to handle null values for FormItemSelect components
const accessLevelValue = computed(() => props.accessLevel || '');
const collectionNameValue = computed(() => props.collectionName || '');
const mimeTypeValue = computed(() => props.mimeType || '');

const accessLevelOptions = [
    { value: null, label: t('media.all_access_levels') },
    { value: AccessLevel.PUBLIC, label: t('media.access_public') },
    { value: AccessLevel.SELF, label: t('media.access_self') },
    { value: AccessLevel.SUPPORT, label: t('media.access_support') },
    { value: AccessLevel.ACADEMY, label: t('media.access_academy') },
];

const collectionOptions = [
    { value: null, label: t('media.all_collections') },
    { value: CollectionType.AVATAR, label: t('media.collection_avatar') },
    { value: CollectionType.COVER, label: t('media.collection_cover') },
    { value: CollectionType.GALLERY, label: t('media.collection_gallery') },
    { value: CollectionType.ATTACHMENTS, label: t('media.collection_attachments') },
    { value: CollectionType.DOCUMENTS, label: t('media.collection_documents') },
    { value: CollectionType.DEFAULT, label: t('media.collection_default') },
];

const sortOptions = [
    { value: SortField.CREATED_AT, label: t('media.sort_created_at') },
    { value: SortField.UPDATED_AT, label: t('media.sort_updated_at') },
    { value: SortField.FILENAME, label: t('media.sort_filename') },
    { value: SortField.SIZE, label: t('media.sort_size') },
    { value: SortField.MIME_TYPE, label: t('media.sort_mime_type') },
];

const sortDirectionOptions = [
    { value: SortDirection.ASC, label: t('media.sort_ascending') },
    { value: SortDirection.DESC, label: t('media.sort_descending') },
];

const mimeTypeOptions = [
    { value: null, label: t('media.all_file_types') },
    { value: 'image/', label: t('media.file_type_images') },
    { value: 'video/', label: t('media.file_type_videos') },
    { value: 'audio/', label: t('media.file_type_audio') },
    { value: 'application/pdf', label: t('media.file_type_pdf') },
    { value: 'text/', label: t('media.file_type_text') },
];

const hasActiveFilters = computed(() => {
    return !!(
        props.searchQuery.trim()
        || props.accessLevel !== null
        || props.collectionName !== null
        || props.mimeType !== null
        || props.sortBy !== SortField.CREATED_AT
        || props.sortDir !== SortDirection.DESC
    );
});

const handleSearchClick = () => {
    emit('search');
};

const handleSearchQueryUpdate = (value: string | null) => {
    const searchValue = value || '';
    emit('update:searchQuery', searchValue);
};

const handleAccessLevelUpdate = (value: string | number | null) => {
    const accessLevel = (value === '' || value === null) ? null : (value as AccessLevel);
    emit('update:accessLevel', accessLevel);
};

const handleCollectionNameUpdate = (value: string | number | null) => {
    const collectionName = (value === '' || value === null) ? null : (value as CollectionType);
    emit('update:collectionName', collectionName);
};

const handleMimeTypeUpdate = (value: string | number | null) => {
    const mimeType = (value === '' || value === null) ? null : (value as string);
    emit('update:mimeType', mimeType);
};

const handleSortByUpdate = (value: string | number | null) => {
    const sortBy = (value as SortField) || SortField.CREATED_AT;
    emit('update:sortBy', sortBy);
};

const handleSortDirUpdate = (value: string | number | null) => {
    const sortDir = (value as SortDirection) || SortDirection.DESC;
    emit('update:sortDir', sortDir);
};

const handleReset = () => {
    emit('update:searchQuery', '');
    emit('update:accessLevel', null);
    emit('update:collectionName', null);
    emit('update:mimeType', null);
    emit('update:sortBy', SortField.CREATED_AT);
    emit('update:sortDir', SortDirection.DESC);
    emit('reset');
};
</script>

<template>
    <div :class="['space-y-4', props.class]">
        <!-- Search and basic filters -->
        <form class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            <FormItemInput
                id="search-query"
                :model-value="searchQuery"
                :title="t('media.search')"
                :placeholder="t('media.search_placeholder')"
                class="flex-1 lg:col-span-6"
                @update:model-value="handleSearchQueryUpdate"
                @keyup.enter="handleSearchClick"
            />
            <!-- Access level filter -->
            <FormItemSelect
                id="access-level"
                class="lg:col-span-3"
                :model-value="accessLevelValue"
                :title="t('media.filter_access_level')"
                :placeholder="t('media.filter_access_level')"
                :data="accessLevelOptions"
                key-value="value"
                name-value="label"
                empty-text="No access levels found"
                @update:model-value="handleAccessLevelUpdate"
            />

            <!-- Collection filter -->
            <FormItemSelect
                id="collection-name"
                class="lg:col-span-3"
                :model-value="collectionNameValue"
                :title="t('media.filter_collection')"
                :placeholder="t('media.filter_collection')"
                :data="collectionOptions"
                key-value="value"
                name-value="label"
                empty-text="No collections found"
                @update:model-value="handleCollectionNameUpdate"
            />
            <!-- MIME type filter -->
            <FormItemSelect
                id="mime-type"
                class="lg:col-span-3"
                :model-value="mimeTypeValue"
                :title="t('media.filter_file_type')"
                :placeholder="t('media.filter_file_type')"
                :data="mimeTypeOptions"
                key-value="value"
                name-value="label"
                empty-text="No file types found"
                @update:model-value="handleMimeTypeUpdate"
            />

            <!-- Sort by -->
            <FormItemSelect
                id="sort-by"
                class="lg:col-span-3"
                :model-value="sortBy"
                :title="t('media.sort_by')"
                :placeholder="t('media.sort_by')"
                :data="sortOptions"
                key-value="value"
                name-value="label"
                empty-text="No sort options found"
                @update:model-value="handleSortByUpdate"
            />

            <!-- Sort direction -->
            <FormItemSelect
                id="sort-direction"
                class="lg:col-span-3"
                :model-value="sortDir"
                :title="t('media.sort_direction')"
                :placeholder="t('media.sort_direction')"
                :data="sortDirectionOptions"
                key-value="value"
                name-value="label"
                empty-text="No sort directions found"
                @update:model-value="handleSortDirUpdate"
            />
            <Button
                v-if="hasActiveFilters"
                variant="outline"
                class="w-full lg:col-span-1"
                @click="handleReset"
            >
                <Icon
                    name="solar:restart-line-duotone"
                    class="!size-4 mr-2 shrink-0"
                />
            </Button>
            <Button
                type="button"
                variant="default"
                class="lg:col-span-1"
                @click="handleSearchClick"
            >
                <Icon
                    name="solar:magnifer-outline"
                    class="!size-4 shrink-0"
                />
            </Button>
        </form>

        <!-- Filter summary -->
        <div
            v-if="hasActiveFilters"
            class="text-sm text-muted-foreground"
        >
            <Icon
                name="solar:filter-outline"
                class="w-4 h-4 inline mr-1"
            />
            {{ t('media.active_filters') }}:
            <span class="font-medium">{{ searchQuery ? `"${searchQuery}"` : '' }}</span>
            <span
                v-if="accessLevel"
                class="ml-2"
            >
                <MediaBadge
                    :access-level="accessLevel"
                    size="sm"
                />
            </span>
            <span
                v-if="collectionName"
                class="ml-2 capitalize"
            >{{ collectionName }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AccessLevel, CollectionType, SortField, SortDirection } from '~/types/media/index'

interface Props {
  searchQuery: string
  accessLevel: AccessLevel | ''
  collectionName: CollectionType | ''
  mimeType: string
  sortBy: SortField
  sortDir: SortDirection
  showAdvanced?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  showAdvanced: false,
  class: ''
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:accessLevel': [value: AccessLevel | '']
  'update:collectionName': [value: CollectionType | '']
  'update:mimeType': [value: string]
  'update:sortBy': [value: SortField]
  'update:sortDir': [value: SortDirection]
  reset: []
}>()

const { t } = useI18n()

const accessLevelOptions = [
  { value: '', label: t('media.all_access_levels') },
  { value: AccessLevel.PUBLIC, label: t('media.access_public') },
  { value: AccessLevel.SELF, label: t('media.access_self') },
  { value: AccessLevel.SUPPORT, label: t('media.access_support') },
  { value: AccessLevel.ACADEMY, label: t('media.access_academy') }
]

const collectionOptions = [
  { value: '', label: t('media.all_collections') },
  { value: CollectionType.AVATAR, label: t('media.collection_avatar') },
  { value: CollectionType.COVER, label: t('media.collection_cover') },
  { value: CollectionType.GALLERY, label: t('media.collection_gallery') },
  { value: CollectionType.ATTACHMENTS, label: t('media.collection_attachments') },
  { value: CollectionType.DOCUMENTS, label: t('media.collection_documents') },
  { value: CollectionType.DEFAULT, label: t('media.collection_default') }
]

const sortOptions = [
  { value: SortField.CREATED_AT, label: t('media.sort_created_at') },
  { value: SortField.UPDATED_AT, label: t('media.sort_updated_at') },
  { value: SortField.FILENAME, label: t('media.sort_filename') },
  { value: SortField.SIZE, label: t('media.sort_size') },
  { value: SortField.MIME_TYPE, label: t('media.sort_mime_type') }
]

const sortDirectionOptions = [
  { value: SortDirection.ASC, label: t('media.sort_ascending') },
  { value: SortDirection.DESC, label: t('media.sort_descending') }
]

const mimeTypeOptions = [
  { value: '', label: t('media.all_file_types') },
  { value: 'image/', label: t('media.file_type_images') },
  { value: 'video/', label: t('media.file_type_videos') },
  { value: 'audio/', label: t('media.file_type_audio') },
  { value: 'application/pdf', label: t('media.file_type_pdf') },
  { value: 'text/', label: t('media.file_type_text') }
]

const hasActiveFilters = computed(() => {
  return !!(
    props.searchQuery.trim() ||
    props.accessLevel ||
    props.collectionName ||
    props.mimeType ||
    props.sortBy !== SortField.CREATED_AT ||
    props.sortDir !== SortDirection.DESC
  )
})

const handleReset = () => {
  emit('update:searchQuery', '')
  emit('update:accessLevel', '')
  emit('update:collectionName', '')
  emit('update:mimeType', '')
  emit('update:sortBy', SortField.CREATED_AT)
  emit('update:sortDir', SortDirection.DESC)
  emit('reset')
}
</script>

<template>
  <div :class="['space-y-4', props.class]">
    <!-- Search and basic filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search input -->
      <div class="flex-1">
        <div class="relative">
          <Icon name="solar:magnifer-outline" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            :model-value="searchQuery"
            :placeholder="t('media.search_placeholder')"
            class="pl-10"
            @update:model-value="emit('update:searchQuery', $event)"
          />
        </div>
      </div>

      <!-- Access level filter -->
      <Select
        :model-value="accessLevel"
        @update:model-value="emit('update:accessLevel', $event)"
      >
        <SelectTrigger class="w-full sm:w-40">
          <SelectValue :placeholder="t('media.filter_access_level')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in accessLevelOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Collection filter -->
      <Select
        :model-value="collectionName"
        @update:model-value="emit('update:collectionName', $event)"
      >
        <SelectTrigger class="w-full sm:w-40">
          <SelectValue :placeholder="t('media.filter_collection')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in collectionOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Reset button -->
      <Button
        v-if="hasActiveFilters"
        variant="outline"
        @click="handleReset"
      >
        <Icon name="solar:restart-outline" class="w-4 h-4 mr-2" />
        {{ t('common.reset') }}
      </Button>
    </div>

    <!-- Advanced filters -->
    <div v-if="showAdvanced" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- MIME type filter -->
      <Select
        :model-value="mimeType"
        @update:model-value="emit('update:mimeType', $event)"
      >
        <SelectTrigger>
          <SelectValue :placeholder="t('media.filter_file_type')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in mimeTypeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Sort by -->
      <Select
        :model-value="sortBy"
        @update:model-value="emit('update:sortBy', $event)"
      >
        <SelectTrigger>
          <SelectValue :placeholder="t('media.sort_by')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Sort direction -->
      <Select
        :model-value="sortDir"
        @update:model-value="emit('update:sortDir', $event)"
      >
        <SelectTrigger>
          <SelectValue :placeholder="t('media.sort_direction')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in sortDirectionOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Filter summary -->
    <div v-if="hasActiveFilters" class="text-sm text-muted-foreground">
      <Icon name="solar:filter-outline" class="w-4 h-4 inline mr-1" />
      {{ t('media.active_filters') }}: 
      <span class="font-medium">{{ searchQuery ? `"${searchQuery}"` : '' }}</span>
      <span v-if="accessLevel" class="ml-2">
        <MediaBadge :access-level="accessLevel" size="sm" />
      </span>
      <span v-if="collectionName" class="ml-2 capitalize">{{ collectionName }}</span>
    </div>
  </div>
</template>

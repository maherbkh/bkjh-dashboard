<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index';

interface Props {
    items: MediaEntity[];
    selected?: MediaEntity[];
    selectable?: boolean;
    showActions?: boolean;
    loading?: boolean;
    emptyMessage?: string;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    selected: () => [],
    selectable: true,
    showActions: false,
    loading: false,
    emptyMessage: '',
    class: '',
});

const emit = defineEmits<{
    select: [media: MediaEntity];
    deselect: [media: MediaEntity];
    edit: [media: MediaEntity];
    delete: [media: MediaEntity];
}>();

const { t } = useI18n();

const isSelected = (media: MediaEntity) => {
    return props.selected?.some(item => item.id === media.id) || false;
};

const handleSelect = (media: MediaEntity) => {
    if (isSelected(media)) {
        emit('deselect', media);
    }
    else {
        emit('select', media);
    }
};

const handleEdit = (media: MediaEntity) => {
    emit('edit', media);
};

const handleDelete = (media: MediaEntity) => {
    emit('delete', media);
};
</script>

<template>
    <div :class="['space-y-2', props.class]">
        <!-- Loading state -->
        <div
            v-if="loading"
            class="space-y-2"
        >
            <div
                v-for="i in 5"
                :key="i"
                class="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 animate-pulse"
            >
                <div class="w-12 h-12 rounded-lg bg-muted" />
                <div class="flex-1 space-y-2">
                    <div class="h-4 bg-muted rounded w-3/4" />
                    <div class="h-3 bg-muted rounded w-1/2" />
                </div>
            </div>
        </div>

        <!-- Media list -->
        <div
            v-else-if="items.length > 0"
            class="space-y-2"
        >
            <MediaListItem
                v-for="media in items"
                :key="media.id"
                :media="media"
                :selected="isSelected(media)"
                :selectable="selectable"
                :show-actions="showActions"
                @select="handleSelect"
                @deselect="handleSelect"
                @edit="handleEdit"
                @delete="handleDelete"
            />
        </div>

        <!-- Empty state -->
        <div
            v-else
            class="text-center py-12"
        >
            <Icon
                name="solar:gallery-minimalistic-outline"
                class="w-16 h-16 mx-auto text-gray-400 mb-4"
            />
            <p class="text-gray-500 dark:text-gray-400">
                {{ emptyMessage || t('media.no_files_found') }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { TableHeaderItem, ActiveDirColumn, SortDirection } from '~/types';

const { t } = useI18n();

const props = withDefaults(defineProps<{
    item?: TableHeaderItem;
    dir?: SortDirection;
    activeDirColumn?: ActiveDirColumn;
    sortable?: boolean;
}>(), {
    item: () => ({
        as: 'th',
        name: 'Header Title',
        id: 'title_id',
    }),
    dir: 'asc',
    active: false,
    sortable: true,
});

// Emits (if needed in parent)
const emit = defineEmits<{
    (e: 'toggleSort', dir: SortDirection, id: string): void;
}>();

// Computed icon name
const iconName = computed(() => {
    return props.dir === 'desc'
        ? 'solar:sort-from-bottom-to-top-linear'
        : 'solar:sort-from-top-to-bottom-linear';
});

const isActive = computed(() => props.activeDirColumn === props.item.id);

const newDir = computed<SortDirection>(() => {
    return isActive.value
        ? (props.dir === 'asc' ? 'desc' : 'asc')
        : 'asc'; // default to 'asc' when switching columns
});
</script>

<template>
    <component
        :is="item.as"
        v-if="item"
        class="text-left"
    >
        <div class="flex items-center gap-5">
            <span>{{ item.name }}</span>
            <button
                v-if="sortable"
                class="size-5 p-1 rounded-sm cursor-pointer hover:bg-muted text-muted-foreground flex items-center justify-center"
                :aria-label="t('global.toggle_sort')"
                @click="emit('toggleSort', newDir, item.id ?? 'no_id_error')"
            >
                <Icon
                    :name="iconName"
                    :class="[
                        activeDirColumn === item.id ? 'text-primary' : '',
                        '!size-5 shrink-0',
                    ]"
                />
            </button>
        </div>
    </component>
</template>

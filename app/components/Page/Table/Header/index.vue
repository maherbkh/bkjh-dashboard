<template>
    <thead>
        <tr class="uppercase text-sm">
            <th
                v-if="selectable"
                class="w-10 pr-0 whitespace-nowrap"
            >
                <Checkbox
                    :model-value="modelValue"
                    @update:model-value="(val: boolean | 'indeterminate') => emit('update:modelValue', !!val && val !== 'indeterminate')"
                />
            </th>
            <PageTableHeaderItem
                v-for="item in items"
                :key="item.id"
                :item="item"
                :active-dir-column="activeDirColumn"
                :dir="dir"
                :sortable="sortable"
                @toggle-sort="(dir, id) => emit('toggleSort', dir, id)"
            />
            <th class="text-right">
                Action
            </th>
        </tr>
    </thead>
</template>

<script setup lang="ts">
import type { TableHeaderItem, SortDirection } from '~/types';

defineProps<{
    items: TableHeaderItem[];
    activeDirColumn: string;
    dir: SortDirection;
    selectable?: boolean;
    modelValue?: boolean;
    sortable?: boolean;
}>();
const emit = defineEmits<{
    (e: 'toggleSort', dir: SortDirection, id: string): void;
    (e: 'update:modelValue', value: boolean): void;
}>();
</script>

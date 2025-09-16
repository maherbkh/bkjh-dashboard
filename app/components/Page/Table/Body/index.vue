<!-- components/PageTableBody.vue -->
<script setup lang="ts">
import { useSlots } from 'vue';

import type { TableHeaderItem } from '~/types';

const props = defineProps<{
    rows: any[]; // Use any[] for flexibility
    columns: TableHeaderItem[]; // Need columns to generate dynamic slots
    loading?: boolean;
    skeletonRows?: number; // Number of skeleton rows to show when loading
    selectable?: boolean;
    selectedRows: (string | number)[];
}>();

const slots = useSlots();

const emit = defineEmits([
    'rowSelected',
]);

// Helper function to safely get nested property values
function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
        return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
}
</script>

<template>
    <tbody>
        <!-- Loading skeleton rows -->
        <template v-if="props.loading">
            <tr
                v-for="skeletonRow in (props.skeletonRows || 25)"
                :key="`skeleton-${skeletonRow}`"
                class="text-sm "
            >
                <td
                    v-if="selectable"
                    class="text-right py-3"
                >
                    <Skeleton class="size-4 ml-auto !rounded-md" />
                </td>
                <td
                    v-for="(column, index) in props.columns"
                    :key="column.id"
                    class="text-left py-3"
                >
                    <Skeleton class="h-4 w-full" />
                    <Skeleton
                        v-if="index === 0"
                        class="mt-2 h-4 w-1/2"
                    />
                </td>
                <td class="text-right py-3">
                    <Skeleton class="h-4 w-16 ml-auto" />
                </td>
            </tr>
        </template>

        <!-- Actual data rows -->
        <template v-else>
            <tr
                v-for="(row, rowIndex) in props.rows"
                :key="rowIndex"
                class="text-sm"
            >
                <td
                    v-if="selectable"
                    class="pr-0 whitespace-nowrap"
                >
                    <Checkbox
                        :model-value="props.selectedRows.includes(row.id)"
                        @update:model-value="(value: boolean | 'indeterminate') => {
                            emit('rowSelected', row.id, value)
                        }"
                    />
                </td>
                <td
                    v-for="column in props.columns"
                    :key="column.id"
                    class="text-left"
                >
                    <!--
                        Dynamic slot name based on column.id
                        Passing the entire row object and column info to allow full HTML customization
                    -->
                    <slot
                        :name="`cell-${column.id}`"
                        :row="row"
                        :column="column"
                        :value="getValueByPath(row, column.id)"
                        :index="rowIndex"
                    >
                        <!-- Default fallback if no slot is provided -->
                        {{ getValueByPath(row, column.id) }}
                    </slot>
                </td>

                <td class="text-right">
                    <slot
                        name="cell-actions"
                        :row="row"
                        :index="rowIndex"
                    >
                        <div>—</div>
                    </slot>
                </td>
            </tr>
        </template>
    </tbody>
</template>

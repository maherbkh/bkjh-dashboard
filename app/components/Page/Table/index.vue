<script setup lang="ts">
import type { TableHeaderItem, ServerParamsTypes, ModelType, SortDirection } from '~/types';

const props = withDefaults(defineProps<{
    headerItems: TableHeaderItem[];
    params?: ServerParamsTypes;
    rows: ModelType | Record<string, any>[]; // More flexible typing
    loading?: boolean;
    skeletonRows?: number;
    selectable?: boolean;
    selectedRows: (string | number)[];
    sortable?: boolean;
    hasActionsSlot?: boolean;
}>(), {
    sortable: true,
    hasActionsSlot: true,
});
const emit = defineEmits<{
    (e: 'toggleSort', dir: SortDirection, id: string): void;
    (e: 'rowSelected', id: string | number, checked: boolean): void;
    (e: 'update:selectedRows', rows: (string | number)[]): void;
}>();

const allRowsSelected = computed(() => {
    if (!Array.isArray(props.rows) || !props.rows.length) return false;
    return props.rows.every((row: any) => props.selectedRows.includes(row.id));
});

const toggleAllRows = (checked: boolean) => {
    if (checked) {
        const allIds = Array.isArray(props.rows) ? props.rows.map((row: any) => row.id) : [];
        emit('update:selectedRows', allIds);
    }
    else {
        emit('update:selectedRows', []);
    }
};
</script>

<template>
    <div class="relative overflow-x-auto">
        <table class="table table-report font-light">
            <PageTableHeader
                :items="headerItems"
                :active-dir-column="params ? params.sortBy : ''"
                :dir="params ? params.sortDir : 'asc'"
                :selectable="selectable"
                :sortable="sortable"
                :has-actions-slot="hasActionsSlot"
                :model-value="allRowsSelected"
                @toggle-sort="(dir, id) => emit('toggleSort', dir, id)"
                @update:model-value="toggleAllRows"
            />
            <PageTableBody
                :rows="Array.isArray(rows) ? rows : []"
                :columns="headerItems"
                :loading="loading"
                :skeleton-rows="skeletonRows"
                :selectable="selectable"
                :selected-rows="selectedRows"
                :has-actions-slot="hasActionsSlot"
                @row-selected="(id, checked) => emit('rowSelected', id, checked)"
            >
                <!-- Forward all slots from parent to PageTableBody -->
                <template
                    v-for="(_, name) in $slots"
                    #[name]="slotData"
                >
                    <slot
                        :name="name"
                        v-bind="slotData"
                    />
                </template>
            </PageTableBody>
        </table>
    </div>
</template>

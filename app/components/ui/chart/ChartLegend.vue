<script setup lang="ts">
import type { BulletLegendItemInterface } from '@unovis/ts';
import { computed } from 'vue';

const props = withDefaults(defineProps<{ items?: BulletLegendItemInterface[] }>(), {
    items: () => [],
});

const emits = defineEmits<{
    'legendItemClick': [d: BulletLegendItemInterface, i: number];
    'update:items': [payload: BulletLegendItemInterface[]];
}>();

const normalizedItems = computed<BulletLegendItemInterface[]>(() =>
    (props.items ?? [])
        .map((item, index) => {
            const fallbackName = `series-${index + 1}`;
            const fallbackColor = '#64748b';
            const name = typeof item?.name === 'string' && item.name.trim().length > 0
                ? item.name
                : fallbackName;
            const color = typeof item?.color === 'string' && item.color.trim().length > 0
                ? item.color
                : fallbackColor;

            return {
                ...item,
                name,
                color,
                inactive: Boolean(item?.inactive),
            };
        }),
);

function onLegendItemClick(d: BulletLegendItemInterface, i: number) {
    emits('legendItemClick', d, i);
    const sourceItems = normalizedItems.value;
    const clickedItem = sourceItems[i];
    if (!clickedItem) return;
    const isBulletActive = !clickedItem.inactive;
    const isFilterApplied = sourceItems.some(item => item.inactive);
    if (isFilterApplied && isBulletActive) {
        emits('update:items', sourceItems.map(item => ({ ...item, inactive: false })));
    }
    else {
        emits('update:items', sourceItems.map(item => item.name === d.name ? ({ ...d, inactive: false }) : { ...item, inactive: true }));
    }
}
</script>

<template>
    <div
        v-if="normalizedItems.length > 0"
        class="w-full flex flex-wrap gap-2"
    >
        <button
            v-for="(item, index) in normalizedItems"
            :key="`${item.name}-${index}`"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            :class="item.inactive ? 'opacity-50' : 'opacity-100'"
            @click="onLegendItemClick(item, index)"
        >
            <span
                class="inline-block size-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: item.color as string }"
            />
            <span class="truncate max-w-40">
                {{ item.name }}
            </span>
        </button>
    </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import type { BulletLegendItemInterface } from '@unovis/ts';
import type { Component } from 'vue';
import type { BaseChartProps } from '.';
import { Axis, CurveType, Line } from '@unovis/ts';

import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue';
import { useMounted } from '@vueuse/core';
import { computed, ref } from 'vue';
import { cn } from '~/lib/utils';
import { ChartCrosshair, ChartLegend, defaultColors } from '~/components/ui/chart';

const props = withDefaults(defineProps<BaseChartProps<T> & {
    /**
   * Render custom tooltip component.
   */
    customTooltip?: Component;
    /**
   * Type of curve
   */
    curveType?: CurveType;
    /**
   * Tooltip title size
   */
    tooltipTitleSize?: 'sm' | 'xs';
    /**
   * Mapping of category keys to display labels (for translation)
   */
    categoryLabels?: Record<string, string>;
}>(), {
    curveType: CurveType.MonotoneX,
    filterOpacity: 0.2,
    margin: () => ({ top: 10, bottom: 40, left: 50, right: 20 }),
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    showGridLine: true,
    tooltipTitleSize: 'xs',
    categoryLabels: () => ({}),
});

const emits = defineEmits<{
    legendItemClick: [d: BulletLegendItemInterface, i: number];
}>();

type KeyOfT = Extract<keyof T, string>;
type Data = typeof props.data[number];

const index = computed(() => props.index as KeyOfT);
const colors = computed(() => props.colors?.length ? props.colors : defaultColors(props.categories.length));

// Get translated category name
const getCategoryLabel = (category: string): string => {
    return props.categoryLabels?.[category] || category;
};

const legendItems = ref<BulletLegendItemInterface[]>(props.categories.map((category, i) => ({
    name: getCategoryLabel(category),
    color: colors.value[i],
    inactive: false,
    originalName: category, // Keep original for data lookup
})));

const isMounted = useMounted();

function handleLegendItemClick(d: BulletLegendItemInterface, i: number) {
    emits('legendItemClick', d, i);
}

// Get muted foreground color from CSS variable
const mutedForegroundColor = computed(() => {
    if (typeof window === 'undefined') {
        return 'oklch(0.552 0.016 285.938)';
    }
    const root = getComputedStyle(document.documentElement);
    return root.getPropertyValue('--muted-foreground').trim() || 'oklch(0.552 0.016 285.938)';
});
</script>

<template>
    <div :class="cn('w-full lg:min-w-[600px] h-[400px] flex flex-col items-end', $attrs.class ?? '')">
        <ChartLegend
            v-if="showLegend"
            v-model:items="legendItems"
            @legend-item-click="handleLegendItemClick"
        />

        <VisXYContainer
            :margin="margin"
            :data="data"
            :style="{ height: isMounted ? '100%' : 'auto' }"
        >
            <ChartCrosshair
                v-if="showTooltip"
                :colors="colors"
                :items="legendItems"
                :index="index"
                :custom-tooltip="customTooltip"
                :tooltip-title-size="tooltipTitleSize"
            />

            <template
                v-for="(category, i) in categories"
                :key="category"
            >
                <VisLine
                    :x="(d: Data, i: number) => i"
                    :y="(d: Data) => d[category]"
                    :curve-type="curveType"
                    :color="colors[i]"
                    :attributes="{
                        [Line.selectors.line]: {
                            opacity: legendItems.find(item => item.name === category)?.inactive ? filterOpacity : 1,
                        },
                    }"
                />
            </template>

            <VisAxis
                v-if="showXAxis"
                type="x"
                :tick-format="xFormatter ?? ((v: number) => data[v]?.[index])"
                :grid-line="false"
                :tick-line="false"
                :tick-text-color="mutedForegroundColor"
            />
            <VisAxis
                v-if="showYAxis"
                type="y"
                :tick-line="false"
                :tick-format="yFormatter"
                :domain-line="false"
                :grid-line="showGridLine"
                :attributes="{
                    [Axis.selectors.grid]: {
                        class: 'text-muted',
                    },
                }"
                :tick-text-color="mutedForegroundColor"
            />

            <slot />
        </VisXYContainer>
    </div>
</template>

<template>
    <Card :class="cardClass">
        <CardHeader
            v-if="title || titleIcon || description"
            class="pb-3"
        >
            <div
                v-if="title || titleIcon"
                class="flex items-center gap-3"
            >
                <Icon
                    v-if="titleIcon"
                    :name="titleIcon"
                    class="!size-5 shrink-0 text-muted-foreground"
                />
                <CardTitle
                    v-if="title"
                    class="text-sm font-medium"
                >
                    {{ title }}
                </CardTitle>
            </div>
            <CardDescription
                v-if="description"
                class="text-xs"
            >
                {{ description }}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <!-- Empty State -->
            <div
                v-if="!chartData || chartData.length === 0"
                class="flex items-center justify-center text-muted-foreground"
                :style="{ height: chartHeight }"
            >
                <div class="text-center">
                    <p class="text-sm font-medium">
                        No data available
                    </p>
                    <p
                        v-if="emptyMessage"
                        class="text-xs mt-1"
                    >
                        {{ emptyMessage }}
                    </p>
                </div>
            </div>

            <!-- Chart -->
            <div
                v-else
                :style="{ height: chartHeight }"
            >
                <LineChart
                    :data="chartData"
                    :index="indexKey"
                    :categories="categories"
                    :colors="colors"
                    :margin="margin"
                    :filter-opacity="filterOpacity"
                    :x-formatter="xFormatter"
                    :y-formatter="yFormatter"
                    :show-legend="showLegend"
                    :show-tooltip="showTooltip"
                    :show-x-axis="showXAxis"
                    :show-y-axis="showYAxis"
                    :show-grid-line="showGridLine"
                    :curve-type="curveType"
                    :custom-tooltip="customTooltip"
                    :category-labels="categoryLabels"
                    @legend-item-click="handleLegendItemClick"
                />
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { BulletLegendItemInterface, Spacing } from '@unovis/ts';

import { CurveType } from '@unovis/ts';
import { computed } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { LineChart } from '~/components/ui/chart-line';

export interface LineChartDataItem extends Record<string, string | number> {}

interface Props {
    /** Chart title displayed in card header */
    title?: string;
    /** Icon for the title (e.g., 'solar:chart-bold') */
    titleIcon?: string;
    /** Chart description displayed in card header */
    description?: string;
    /** Chart data array */
    data: LineChartDataItem[];
    /** Key to use as index/label for each data point */
    indexKey: string;
    /** Array of category keys to display */
    categories: string[];
    /** Custom colors array */
    colors?: string[];
    /** Margin of the chart container */
    margin?: Spacing;
    /** Opacity for non-selected items */
    filterOpacity?: number;
    /** Function to format X axis labels */
    xFormatter?: (tick: number | Date, i: number, ticks: number[] | Date[]) => string;
    /** Function to format Y axis labels */
    yFormatter?: (tick: number | Date, i: number, ticks: number[] | Date[]) => string;
    /** Show legend */
    showLegend?: boolean;
    /** Show tooltip */
    showTooltip?: boolean;
    /** Show X axis */
    showXAxis?: boolean;
    /** Show Y axis */
    showYAxis?: boolean;
    /** Show grid lines */
    showGridLine?: boolean;
    /** Type of curve for the line (defaults to MonotoneX) */
    curveType?: typeof CurveType[keyof typeof CurveType];
    /** Custom tooltip component */
    customTooltip?: Component;
    /** Custom card class */
    cardClass?: string;
    /** Chart height (default: 400px) */
    chartHeight?: string;
    /** Empty state message */
    emptyMessage?: string;
    /** Mapping of category keys to display labels (for translation) */
    categoryLabels?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
    showLegend: true,
    showTooltip: true,
    showXAxis: true,
    showYAxis: true,
    showGridLine: true,
    filterOpacity: 0.2,
    margin: () => ({ top: 10, bottom: 40, left: 50, right: 20 }),
    chartHeight: '400px',
    cardClass: 'bg-muted/50 border-border/50',
    curveType: CurveType.MonotoneX,
    yFormatter: (tick: number | Date) => {
        if (typeof tick === 'number') {
            return tick.toLocaleString();
        }
        return tick.toString();
    },
});

const emit = defineEmits<{
    legendItemClick: [d: BulletLegendItemInterface, i: number];
}>();

const chartData = computed(() => props.data);

const handleLegendItemClick = (d: BulletLegendItemInterface, i: number) => {
    emit('legendItemClick', d, i);
};
</script>

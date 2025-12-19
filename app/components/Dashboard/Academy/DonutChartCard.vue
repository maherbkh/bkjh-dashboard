<template>
    <Card :class="cardClass">
        <CardHeader
            v-if="title || titleIcon || description"
            class="pb-3"
        >
            <div
                v-if="title || titleIcon"
                class="flex items-center gap-2"
            >
                <Icon
                    v-if="titleIcon"
                    :name="titleIcon"
                    class="size-4 text-muted-foreground"
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
                <DonutChart
                    :data="chartData"
                    :index="indexKey"
                    :category="categoryKey"
                    :colors="colors"
                    :margin="margin"
                    :filter-opacity="filterOpacity"
                    :value-formatter="valueFormatter"
                    :show-legend="showLegend"
                    :show-tooltip="showTooltip"
                    :type="type"
                    :sort-function="sortFunction"
                    :custom-tooltip="customTooltip"
                />
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { Spacing } from '@unovis/ts';
import { computed } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { DonutChart } from '~/components/ui/chart-donut';

export type DonutChartDataItem = Record<string, string | number>;

interface Props {
    /** Chart title displayed in card header */
    title?: string;
    /** Icon for the title (e.g., 'solar:chart-bold') */
    titleIcon?: string;
    /** Chart description displayed in card header */
    description?: string;
    /** Chart data array */
    data: DonutChartDataItem[];
    /** Key to use as index/label for each data point */
    indexKey: string;
    /** Key containing the quantitative chart values */
    categoryKey: string;
    /** Custom colors array */
    colors?: string[];
    /** Margin of the chart container */
    margin?: Spacing;
    /** Opacity for non-selected items */
    filterOpacity?: number;
    /** Function to format values */
    valueFormatter?: (tick: number, i?: number, ticks?: number[]) => string;
    /** Show legend */
    showLegend?: boolean;
    /** Show tooltip */
    showTooltip?: boolean;
    /** Chart type: donut or pie */
    type?: 'donut' | 'pie';
    /** Function to sort segments */
    sortFunction?: (a: any, b: any) => number | undefined;
    /** Custom tooltip component */
    customTooltip?: Component;
    /** Custom card class */
    cardClass?: string;
    /** Chart height (default: 192px / 12rem) */
    chartHeight?: string;
    /** Empty state message */
    emptyMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
    showLegend: true,
    showTooltip: true,
    type: 'donut',
    filterOpacity: 0.2,
    margin: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    chartHeight: '192px',
    cardClass: 'bg-muted/50 border-border/50',
    valueFormatter: (tick: number) => tick.toLocaleString(),
    sortFunction: () => undefined,
});

const chartData = computed(() => props.data);
</script>

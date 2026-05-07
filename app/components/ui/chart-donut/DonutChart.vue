<script setup lang="ts" generic="T extends Record<string, any>">
import type { Component } from 'vue';
import type { BaseChartProps } from '.';
import { Donut } from '@unovis/ts';
import { VisDonut, VisSingleContainer } from '@unovis/vue';
import { useMounted } from '@vueuse/core';
import { computed, ref } from 'vue';
import { cn } from '~/lib/utils';
import { ChartSingleTooltip, defaultColors } from '~/components/ui/chart';

const props = withDefaults(defineProps<Pick<BaseChartProps<T>, 'data' | 'colors' | 'index' | 'margin' | 'showLegend' | 'showTooltip' | 'filterOpacity'> & {
    /**
   * Sets the name of the key containing the quantitative chart values.
   */
    category: KeyOfT;
    /**
   * Change the type of the chart
   * @default "donut"
   */
    type?: 'donut' | 'pie';
    /**
   * Function to sort the segment
   */
    sortFunction?: (a: any, b: any) => number | undefined;
    /**
   * Controls the formatting for the label.
   */
    valueFormatter?: (tick: number, i?: number, ticks?: number[]) => string;
    /**
   * Render custom tooltip component.
   */
    customTooltip?: Component;
}>(), {
    margin: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    sortFunction: () => undefined,
    type: 'donut',
    filterOpacity: 0.2,
    showTooltip: true,
    showLegend: true,
});

type KeyOfT = Extract<keyof T, string>;
type Data = typeof props.data[number];

const valueFormatter = props.valueFormatter ?? ((tick: number) => `${tick}`);
const category = computed(() => props.category as KeyOfT);
const index = computed(() => props.index as KeyOfT);

function toFiniteNumber(value: unknown): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}

const isMounted = useMounted();
const activeSegmentKey = ref<string>();
const sanitizedData = computed(() => {
    return props.data.filter((entry) => {
        const value = toFiniteNumber(entry[category.value]);
        return value > 0;
    });
});
const colors = computed(() => props.colors?.length ? props.colors : defaultColors(sanitizedData.value.length));
const legendItems = computed(() => sanitizedData.value.map((item, i) => ({
    name: String(item[index.value] ?? `series-${i + 1}`),
    color: colors.value[i],
    inactive: false,
})));

const totalValue = computed(() => sanitizedData.value.reduce((prev, curr) => prev + toFiniteNumber(curr[category.value]), 0));
</script>

<template>
    <div :class="cn('w-full h-48 flex flex-col items-end', $attrs.class ?? '')">
        <VisSingleContainer
            :style="{ height: isMounted ? '100%' : 'auto' }"
            :margin="{ left: 20, right: 20 }"
            :data="sanitizedData"
        >
            <ChartSingleTooltip
                :selector="Donut.selectors.segment"
                :index="category"
                :items="legendItems"
                :value-formatter="valueFormatter"
                :custom-tooltip="customTooltip"
            />

            <VisDonut
                :value="(d: Data) => toFiniteNumber(d[category])"
                :sort-function="sortFunction"
                :color="colors"
                :arc-width="type === 'donut' ? 20 : 0"
                :show-background="false"
                :central-label="type === 'donut' && totalValue > 0 ? valueFormatter(totalValue) : ''"
                :events="{
                    [Donut.selectors.segment]: {
                        click: (d: Data, ev: PointerEvent, i: number, elements: HTMLElement[]) => {
                            if (d?.data?.[index] === activeSegmentKey) {
                                activeSegmentKey = undefined
                                elements.forEach(el => el.style.opacity = '1')
                            }
                            else {
                                activeSegmentKey = d?.data?.[index]
                                elements.forEach(el => el.style.opacity = `${filterOpacity}`)
                                elements[i].style.opacity = '1'
                            }
                        },
                    },
                }"
            />

            <slot />
        </VisSingleContainer>
    </div>
</template>

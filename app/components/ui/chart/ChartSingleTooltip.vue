<script setup lang="ts">
import type { BulletLegendItemInterface } from '@unovis/ts';
import type { Component } from 'vue';
import { omit } from '@unovis/ts';
import { VisTooltip } from '@unovis/vue';
import { createApp } from 'vue';
import { ChartTooltip } from '.';

const props = defineProps<{
    selector: string;
    index: string;
    items?: BulletLegendItemInterface[];
    valueFormatter?: (tick: number, i?: number, ticks?: number[]) => string;
    customTooltip?: Component;
}>();

// Use weakmap to store reference to each datapoint for Tooltip
const wm = new WeakMap();
const toFiniteNumber = (value: unknown): number => {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

const toSafeTitle = (value: unknown): string => {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number')
        return Number.isFinite(value) ? value.toString() : '';
    return value == null ? '' : String(value);
};

function template(d: any, i: number, elements: (HTMLElement | SVGElement)[]) {
    const valueFormatter = props.valueFormatter ?? ((tick: number) => `${tick}`);
    if (props.index in d) {
        if (wm.has(d)) {
            return wm.get(d);
        }
        else {
            const componentDiv = document.createElement('div');
            const omittedData = Object.entries(omit(d, [props.index])).map(([key, value]) => {
                const legendReference = props.items?.find(i => i.name === key);
                return { ...legendReference, value: valueFormatter(toFiniteNumber(value)) };
            });
            const TooltipComponent = props.customTooltip ?? ChartTooltip;
            createApp(TooltipComponent, { title: toSafeTitle(d[props.index]), data: omittedData }).mount(componentDiv);
            wm.set(d, componentDiv.innerHTML);
            return componentDiv.innerHTML;
        }
    }

    else {
        const data = d.data;

        if (wm.has(data)) {
            return wm.get(data);
        }
        else {
            const style = getComputedStyle(elements[i]);
            const omittedData = [{ name: toSafeTitle(data.name), value: valueFormatter(toFiniteNumber(data[props.index])), color: style.fill }];
            const componentDiv = document.createElement('div');
            const TooltipComponent = props.customTooltip ?? ChartTooltip;
            createApp(TooltipComponent, { title: toSafeTitle(d[props.index]), data: omittedData }).mount(componentDiv);
            wm.set(d, componentDiv.innerHTML);
            return componentDiv.innerHTML;
        }
    }
}
</script>

<template>
    <VisTooltip
        :horizontal-shift="20"
        :vertical-shift="20"
        :triggers="{
            [selector]: template,
        }"
    />
</template>

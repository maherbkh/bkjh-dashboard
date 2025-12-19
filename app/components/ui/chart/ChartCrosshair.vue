<script setup lang="ts">
import type { BulletLegendItemInterface } from '@unovis/ts';
import type { Component } from 'vue';
import { omit } from '@unovis/ts';
import { VisCrosshair, VisTooltip } from '@unovis/vue';
import { createApp } from 'vue';
import { ChartTooltip } from '.';

const props = withDefaults(defineProps<{
    colors?: string[];
    index: string;
    items: BulletLegendItemInterface[];
    customTooltip?: Component;
    tooltipTitleSize?: 'sm' | 'xs';
}>(), {
    colors: () => [],
    tooltipTitleSize: 'sm',
});

// Use weakmap to store reference to each datapoint for Tooltip
const wm = new WeakMap();
function template(d: any) {
    if (wm.has(d)) {
        return wm.get(d);
    }
    else {
        const componentDiv = document.createElement('div');
        const omittedData = Object.entries(omit(d, [props.index])).map(([key, value]) => {
            // Find legend item by original name (if available) or by display name
            const legendReference = props.items.find(i =>
                (i as any).originalName === key || i.name === key,
            );
            // Use the display name from legend if available, otherwise use the key
            const displayName = legendReference?.name || key;
            return { ...legendReference, name: displayName, value };
        });
        const TooltipComponent = props.customTooltip ?? ChartTooltip;
        createApp(TooltipComponent, { title: d[props.index].toString(), data: omittedData, titleSize: props.tooltipTitleSize }).mount(componentDiv);
        wm.set(d, componentDiv.innerHTML);
        return componentDiv.innerHTML;
    }
}

function color(d: unknown, i: number) {
    return props.colors[i] ?? 'transparent';
}
</script>

<template>
    <VisTooltip
        :horizontal-shift="20"
        :vertical-shift="20"
    />
    <VisCrosshair
        :template="template"
        :color="color"
    />
</template>

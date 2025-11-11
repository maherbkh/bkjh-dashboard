<script setup lang="ts" generic="T extends Record<string, any>">
import type { BulletLegendItemInterface } from "@unovis/ts"
import type { Component } from "vue"
import type { BaseChartProps } from "."
import { Axis, GroupedBar, StackedBar } from "@unovis/ts"
import { VisAxis, VisGroupedBar, VisStackedBar, VisXYContainer } from "@unovis/vue"
import { useMounted } from "@vueuse/core"
import { computed, ref } from "vue"
import { cn } from '~/lib/utils'
import { ChartCrosshair, ChartLegend, defaultColors } from '~/components/ui/chart'

const props = withDefaults(defineProps<BaseChartProps<T> & {
  /**
   * Render custom tooltip component.
   */
  customTooltip?: Component
  /**
   * Change the type of the chart
   * @default "grouped"
   */
  type?: "stacked" | "grouped"
  /**
   * Rounded bar corners
   * @default 0
   */
  roundedCorners?: number
  /**
   * Mapping of category keys to display labels (for translation)
   */
  categoryLabels?: Record<string, string>
}>(), {
  type: "grouped",
  margin: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  filterOpacity: 0.2,
  roundedCorners: 0,
  showXAxis: true,
  showYAxis: true,
  showTooltip: true,
  showLegend: true,
  showGridLine: true,
  categoryLabels: () => ({})
})
const emits = defineEmits<{
  legendItemClick: [d: BulletLegendItemInterface, i: number]
}>()

type KeyOfT = Extract<keyof T, string>
type Data = typeof props.data[number]

const index = computed(() => props.index as KeyOfT)
const colors = computed(() => props.colors?.length ? props.colors : defaultColors(props.categories.length))

// Get translated category name
const getCategoryLabel = (category: string): string => {
  return props.categoryLabels?.[category] || category;
}

const legendItems = ref<BulletLegendItemInterface[]>(props.categories.map((category, i) => ({
  name: getCategoryLabel(category),
  color: colors.value[i],
  inactive: false,
  originalName: category, // Keep original for data lookup
})))

const isMounted = useMounted()

function handleLegendItemClick(d: BulletLegendItemInterface, i: number) {
  emits("legendItemClick", d, i)
}

const VisBarComponent = computed(() => props.type === "grouped" ? VisGroupedBar : VisStackedBar)
const selectorsBar = computed(() => props.type === "grouped" ? GroupedBar.selectors.bar : StackedBar.selectors.bar)

// Get muted foreground color from CSS variable
const mutedForegroundColor = computed(() => {
  if (typeof window === 'undefined') {
    return 'oklch(0.552 0.016 285.938)';
  }
  const root = getComputedStyle(document.documentElement);
  return root.getPropertyValue('--muted-foreground').trim() || 'oklch(0.552 0.016 285.938)';
})
</script>

<template>
  <div :class="cn('w-full h-[400px] flex flex-col items-end overflow-hidden', $attrs.class ?? '')" :style="{ contain: 'layout style paint', clipPath: 'inset(0)' }">
    <ChartLegend v-if="showLegend" v-model:items="legendItems" @legend-item-click="handleLegendItemClick" />

    <VisXYContainer
      :data="data"
      :style="{ height: isMounted ? '100%' : 'auto', overflow: 'hidden', contain: 'layout style paint', clipPath: 'inset(0)' }"
      :margin="margin"
      class="overflow-hidden"
    >
      <ChartCrosshair v-if="showTooltip" :colors="colors" :items="legendItems" :custom-tooltip="customTooltip" :index="index" />

      <VisBarComponent
        :x="(d: Data, i: number) => i"
        :y="categories.map(category => (d: Data) => d[category]) "
        :color="colors"
        :rounded-corners="roundedCorners"
        :bar-padding="0.05"
        :attributes="{
          [selectorsBar]: {
            opacity: (d: Data, i:number) => {
              const pos = i % categories.length
              return legendItems[pos]?.inactive ? filterOpacity : 1
            },
          },
        }"
      />

      <VisAxis
        v-if="showXAxis"
        type="x"
        :tick-format="xFormatter ?? ((v: number) => data[v]?.[index])"
        :grid-line="false"
        :tick-line="false"
        :tick-text-color="mutedForegroundColor"
        :attributes="{
          [Axis.selectors.tick]: {
            style: 'font-size: 10px !important; max-width: 60px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; display: inline-block !important; word-break: break-all !important;',
            class: '!overflow-hidden !text-ellipsis !whitespace-nowrap'
          },
          [Axis.selectors.label]: {
            style: 'font-size: 10px !important; max-width: 60px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; display: inline-block !important; word-break: break-all !important;',
            class: '!overflow-hidden !text-ellipsis !whitespace-nowrap'
          },
          'text': {
            style: 'font-size: 10px !important; max-width: 60px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important;',
            class: '!overflow-hidden !text-ellipsis !whitespace-nowrap'
          }
        }"
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
          [Axis.selectors.tick]: {
            style: 'font-size: 10px !important;',
          },
          [Axis.selectors.label]: {
            style: 'font-size: 10px !important;'
          }
        }"
        :tick-text-color="mutedForegroundColor"
      />

      <slot />
    </VisXYContainer>
  </div>
</template>

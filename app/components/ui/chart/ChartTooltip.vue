<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

withDefaults(defineProps<{
  title?: string
  data: {
    name: string
    color: string
    value: any
  }[]
  titleSize?: 'sm' | 'xs'
}>(), {
  titleSize: 'xs'
})
</script>

<template>
  <Card class="text-sm !bg-card shadow-lg backdrop-blur-none" style="opacity: 1 !important; background-color: var(--card) !important;">
    <CardHeader v-if="title" class="p-3 border-b">
      <CardTitle :class="[(titleSize === 'xs' ? 'text-xs font-medium' : 'text-sm font-medium'), '']">
        
        <div class="max-w-[180px] truncate !text-sm">{{ title }}</div>
      </CardTitle>
    </CardHeader>
    <CardContent class="p-3 min-w-[200px] flex flex-col gap-1">
      <div v-for="(item, key) in data" :key="key" class="flex justify-between">
        <div class="flex items-center">
          <span class="w-2.5 h-2.5 mr-2">
            <svg width="100%" height="100%" viewBox="0 0 30 30">
              <path
                d=" M 15 15 m -14, 0 a 14,14 0 1,1 28,0 a 14,14 0 1,1 -28,0"
                :stroke="item.color"
                :fill="item.color"
                stroke-width="1"
              />
            </svg>
          </span>
          <span>{{ item.name }}</span>
        </div>
        <span class="font-semibold ml-4">{{ item.value }}</span>
      </div>
    </CardContent>
  </Card>
</template>

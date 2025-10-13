<script setup lang="ts">
import { mediaFormatter } from '~/services/media'

interface Props {
  date: string
  format?: 'relative' | 'absolute' | 'both'
  showIcon?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'relative',
  showIcon: true,
  class: ''
})

const formattedDate = computed(() => {
  switch (props.format) {
    case 'relative':
      return mediaFormatter.formatRelativeDate(props.date)
    case 'absolute':
      return mediaFormatter.formatDate(props.date)
    case 'both':
      return `${mediaFormatter.formatRelativeDate(props.date)} (${mediaFormatter.formatDate(props.date)})`
    default:
      return mediaFormatter.formatRelativeDate(props.date)
  }
})

const tooltip = computed(() => {
  if (props.format === 'relative') {
    return mediaFormatter.formatDate(props.date)
  }
  return undefined
})
</script>

<template>
  <Tooltip v-if="tooltip" :content="tooltip">
    <div :class="['inline-flex items-center gap-1 text-sm text-muted-foreground', props.class]">
      <Icon
        v-if="showIcon"
        name="solar:calendar-outline"
        class="w-3 h-3"
      />
      <span>{{ formattedDate }}</span>
    </div>
  </Tooltip>
  
  <div
    v-else
    :class="['inline-flex items-center gap-1 text-sm text-muted-foreground', props.class]"
  >
    <Icon
      v-if="showIcon"
      name="solar:calendar-outline"
      class="w-3 h-3"
    />
    <span>{{ formattedDate }}</span>
  </div>
</template>

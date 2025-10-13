<script setup lang="ts">
import { mediaFormatter } from '~/services/media'

interface Props {
  size: number | string
  showIcon?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  class: ''
})

const formattedSize = computed(() => {
  return mediaFormatter.formatFileSize(props.size)
})
</script>

<template>
  <div :class="['inline-flex items-center gap-1 text-sm text-muted-foreground', props.class]">
    <Icon
      v-if="showIcon"
      name="solar:hard-drive-outline"
      class="w-3 h-3"
    />
    <span>{{ formattedSize }}</span>
  </div>
</template>

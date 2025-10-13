<template>
  <div
    :class="[
      'animate-pulse bg-muted rounded-lg',
      variant === 'card' ? 'aspect-square' : '',
      variant === 'list' ? 'h-16' : '',
      variant === 'grid' ? 'aspect-square' : '',
      className
    ]"
  >
    <div v-if="variant === 'card'" class="p-4 space-y-3">
      <div class="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
      <div class="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
    </div>
    
    <div v-else-if="variant === 'list'" class="flex items-center space-x-3 p-3">
      <div class="w-12 h-12 bg-muted-foreground/20 rounded"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div class="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
      </div>
    </div>
    
    <div v-else-if="variant === 'grid'" class="p-2 space-y-2">
      <div class="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
      <div class="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
    </div>
    
    <div v-else class="p-4 space-y-2">
      <div class="h-4 bg-muted-foreground/20 rounded w-full"></div>
      <div class="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'card' | 'list' | 'grid' | 'default'
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  className: ''
})
</script>

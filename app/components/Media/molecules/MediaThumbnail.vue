<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index'
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage'
import { isImageFile } from '~/types/media/index'

interface Props {
  media: MediaEntity
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showOverlay?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showOverlay: false,
  class: ''
})

const { getDirectImageSrc } = useAuthenticatedImage()

const isImage = computed(() => isImageFile(props.media.mimeType))

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-12 h-12'
    case 'md':
      return 'w-16 h-16'
    case 'lg':
      return 'w-24 h-24'
    case 'xl':
      return 'w-32 h-32'
    default:
      return 'w-16 h-16'
  }
})

const imageSrc = computed(() => {
  if (isImage.value) {
    return getDirectImageSrc(props.media)
  }
  return null
})
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden rounded-lg border border-border bg-card/50',
      sizeClasses,
      props.class
    ]"
  >
    <!-- Image thumbnail -->
    <NuxtImg
      v-if="isImage && imageSrc"
      :src="imageSrc"
      :alt="media.altText || media.filename"
      class="w-full h-full object-cover"
      loading="lazy"
    />
    
    <!-- Non-image file icon -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-muted"
    >
      <MediaIcon
        :mime-type="media.mimeType"
        size="lg"
        class="text-muted-foreground"
      />
    </div>
    
    <!-- Overlay with file info -->
    <div
      v-if="showOverlay"
      class="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
    >
      <div class="text-center text-white p-2">
        <p class="text-sm font-medium truncate">{{ media.filename }}</p>
        <MediaSize :size="media.size" class="text-xs" />
      </div>
    </div>
    
    <!-- Selection indicator -->
    <div
      v-if="$attrs['data-selected']"
      class="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
    >
      <Icon name="solar:check-circle-bold" class="w-3 h-3 text-primary-foreground" />
    </div>
  </div>
</template>

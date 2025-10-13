<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index'
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage'
import { isImageFile } from '~/types/media/index'

interface Props {
  media: MediaEntity
  selected?: boolean
  selectable?: boolean
  showActions?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  selectable: true,
  showActions: false,
  class: ''
})

const emit = defineEmits<{
  select: [media: MediaEntity]
  deselect: [media: MediaEntity]
  edit: [media: MediaEntity]
  delete: [media: MediaEntity]
}>()

const { getImageSrc } = useAuthenticatedImage()

const isImage = computed(() => isImageFile(props.media.mimeType))

const imageSrc = computed(() => {
  if (isImage.value) {
    return getImageSrc(props.media)
  }
  return null
})

const handleClick = () => {
  if (!props.selectable) return
  
  if (props.selected) {
    emit('deselect', props.media)
  } else {
    emit('select', props.media)
  }
}

const handleEdit = (event: Event) => {
  event.stopPropagation()
  emit('edit', props.media)
}

const handleDelete = (event: Event) => {
  event.stopPropagation()
  emit('delete', props.media)
}
</script>

<template>
  <div
    :class="[
      'relative group cursor-pointer rounded-lg border-2 transition-all duration-300 hover-lift',
      'bg-card/50 backdrop-blur-sm shadow-premium',
      selected ? 'border-primary ring-2 ring-primary/20 shadow-premium-lg' : 'border-border hover:border-primary/50',
      props.class
    ]"
    @click="handleClick"
  >
    <!-- Media thumbnail -->
    <div class="aspect-square overflow-hidden rounded-lg">
      <NuxtImg
        v-if="isImage && imageSrc"
        :src="imageSrc"
        :alt="media.altText || media.filename"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-muted"
      >
        <MediaIcon
          :mime-type="media.mimeType"
          size="xl"
          class="text-muted-foreground"
        />
      </div>
    </div>

    <!-- File info overlay -->
    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 text-xs">
      <div class="truncate font-medium">{{ media.filename }}</div>
      <div class="flex items-center gap-1 text-muted-foreground">
        <MediaSize :size="media.size" :show-icon="false" />
      </div>
    </div>

    <!-- Selection indicator -->
    <div
      v-if="selected"
      class="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-premium"
    >
      <Icon name="solar:check-circle-bold" class="w-4 h-4 text-primary-foreground" />
    </div>

    <!-- Hover overlay -->
    <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
      <div class="bg-background/90 backdrop-blur-sm rounded-full p-2">
        <Icon name="solar:eye-outline" class="w-5 h-5 text-primary" />
      </div>
    </div>

    <!-- Action buttons -->
    <div
      v-if="showActions"
      class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1"
    >
      <Button
        size="sm"
        variant="secondary"
        class="h-6 w-6 p-0"
        @click="handleEdit"
      >
        <Icon name="solar:pen-outline" class="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        class="h-6 w-6 p-0"
        @click="handleDelete"
      >
        <Icon name="solar:trash-bin-minimalistic-outline" class="w-3 h-3" />
      </Button>
    </div>
  </div>
</template>

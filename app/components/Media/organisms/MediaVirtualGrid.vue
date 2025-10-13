<template>
  <div
    ref="containerRef"
    :style="getContainerStyle()"
    @scroll="handleScroll"
  >
    <div :style="getListStyle()">
      <div
        v-for="(item, index) in visibleItems"
        :key="item.id"
        :style="getItemStyle(startIndex + index)"
        class="p-2"
      >
        <MediaCard
          :media="item"
          :selected="selection.isSelected(item)"
          @click="selection.toggle(item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index'
import { useMediaVirtualScrolling } from '~/composables/media'
import MediaCard from '~/components/Media/molecules/MediaCard.vue'

interface Props {
  items: MediaEntity[]
  itemHeight?: number
  containerHeight?: number
  overscan?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 200,
  containerHeight: 400,
  overscan: 5
})

const emit = defineEmits<{
  'update:selection': [items: MediaEntity[]]
}>()

const containerRef = ref<HTMLElement>()

const {
  scrollTop,
  totalHeight,
  visibleItems,
  startIndex,
  endIndex,
  offsetY,
  isScrolling,
  handleScroll,
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  isItemVisible,
  getItemStyle,
  getContainerStyle,
  getListStyle
} = useMediaVirtualScrolling(
  toRef(props, 'items'),
  {
    itemHeight: props.itemHeight,
    containerHeight: props.containerHeight,
    overscan: props.overscan
  }
)

// Selection logic (you can integrate with useMediaSelection if needed)
const selectedItems = ref<MediaEntity[]>([])

const selection = {
  isSelected: (item: MediaEntity) => selectedItems.value.some(i => i.id === item.id),
  toggle: (item: MediaEntity) => {
    const index = selectedItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(item)
    }
    emit('update:selection', selectedItems.value)
  }
}

// Expose methods for parent components
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  isItemVisible
})
</script>

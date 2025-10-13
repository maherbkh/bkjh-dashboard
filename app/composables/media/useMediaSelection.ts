import type { MediaEntity } from '~/types/media/index'

/**
 * Media selection composable
 * Handles selection state management for media components
 */
export function useMediaSelection(multiple = false, maxSelection = Infinity) {
  const selected = ref<MediaEntity[]>([])
  
  /**
   * Select a media item
   */
  const select = (media: MediaEntity) => {
    if (!multiple) {
      selected.value = [media]
      return
    }
    
    if (selected.value.length >= maxSelection) return
    
    if (!selected.value.some(m => m.id === media.id)) {
      selected.value = [...selected.value, media]
    }
  }
  
  /**
   * Deselect a media item
   */
  const deselect = (media: MediaEntity) => {
    selected.value = selected.value.filter(m => m.id !== media.id)
  }
  
  /**
   * Toggle selection of a media item
   */
  const toggle = (media: MediaEntity) => {
    if (isSelected(media)) {
      deselect(media)
    } else {
      select(media)
    }
  }
  
  /**
   * Check if a media item is selected
   */
  const isSelected = (media: MediaEntity): boolean => {
    return selected.value.some(m => m.id === media.id)
  }
  
  /**
   * Clear all selections
   */
  const clearSelection = () => {
    selected.value = []
  }
  
  /**
   * Set selection from external source
   */
  const setSelection = (items: MediaEntity[]) => {
    if (!multiple && items.length > 0) {
      selected.value = [items[0]!]
    } else {
      selected.value = items.slice(0, maxSelection)
    }
  }
  
  /**
   * Get selected IDs
   */
  const selectedIds = computed(() => selected.value.map(m => m.id))
  
  /**
   * Check if there are any selections
   */
  const hasSelection = computed(() => selected.value.length > 0)
  
  /**
   * Get selection count
   */
  const selectionCount = computed(() => selected.value.length)
  
  /**
   * Check if more items can be selected
   */
  const canSelectMore = computed(() => selected.value.length < maxSelection)
  
  /**
   * Get first selected item (for single selection)
   */
  const firstSelected = computed(() => selected.value[0] || null)
  
  /**
   * Get last selected item
   */
  const lastSelected = computed(() => selected.value[selected.value.length - 1] || null)
  
  return {
    selected: readonly(selected),
    selectedIds,
    hasSelection,
    selectionCount,
    canSelectMore,
    firstSelected,
    lastSelected,
    select,
    deselect,
    toggle,
    isSelected,
    clearSelection,
    setSelection
  }
}

// Vue composables are auto-imported in Nuxt

export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  threshold?: number
}

export function useMediaVirtualScrolling(
  items: Ref<any[]>,
  options: VirtualScrollOptions
) {
  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()
  
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 100
  } = options

  const totalHeight = computed(() => items.value.length * itemHeight)
  
  const visibleCount = computed(() => 
    Math.ceil(containerHeight / itemHeight) + overscan
  )
  
  const startIndex = computed(() => 
    Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
  )
  
  const endIndex = computed(() => 
    Math.min(items.value.length, startIndex.value + visibleCount.value)
  )
  
  const visibleItems = computed(() => 
    items.value.slice(startIndex.value, endIndex.value)
  )
  
  const offsetY = computed(() => startIndex.value * itemHeight)
  
  const isScrolling = ref(false)
  const scrollTimeout = ref<NodeJS.Timeout>()
  
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
    
    // Debounce scrolling state
    isScrolling.value = true
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }
    scrollTimeout.value = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }
  
  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      const targetScrollTop = index * itemHeight
      containerRef.value.scrollTop = targetScrollTop
    }
  }
  
  const scrollToTop = () => {
    scrollToIndex(0)
  }
  
  const scrollToBottom = () => {
    scrollToIndex(items.value.length - 1)
  }
  
  const isItemVisible = (index: number): boolean => {
    return index >= startIndex.value && index < endIndex.value
  }
  
  const getItemStyle = (index: number) => ({
    position: 'absolute' as const,
    top: `${index * itemHeight}px`,
    height: `${itemHeight}px`,
    width: '100%'
  })
  
  const getContainerStyle = () => ({
    height: `${containerHeight}px`,
    overflow: 'auto' as const,
    position: 'relative' as const
  })
  
  const getListStyle = () => ({
    height: `${totalHeight.value}px`,
    position: 'relative' as const,
    transform: `translateY(${offsetY.value}px)`
  })
  
  return {
    containerRef,
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
  }
}

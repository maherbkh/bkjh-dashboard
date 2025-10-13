import type { MediaQueryDto } from '~/types/media/index'
import { AccessLevel, CollectionType, SortField, SortDirection } from '~/types/media/index'
import { MEDIA_CONSTANTS } from '~/utils/media'

/**
 * Media filters composable
 * Handles filter state management for media queries
 */
export function useMediaFilters() {
  // Filter state
  const searchQuery = ref('')
  const accessLevel = ref<AccessLevel | ''>('')
  const collectionName = ref<CollectionType | ''>('')
  const mimeType = ref('')
  const modelType = ref('')
  const modelId = ref('')
  
  // Pagination state
  const page = ref(1)
  const length = ref(MEDIA_CONSTANTS.DEFAULT_PAGE_SIZE)
  
  // Sort state
  const sortBy = ref<SortField>(SortField.CREATED_AT)
  const sortDir = ref<SortDirection>(SortDirection.DESC)
  
  /**
   * Reset all filters to default values
   */
  const resetFilters = () => {
    searchQuery.value = ''
    accessLevel.value = ''
    collectionName.value = ''
    mimeType.value = ''
    modelType.value = ''
    modelId.value = ''
    page.value = 1
    sortBy.value = SortField.CREATED_AT
    sortDir.value = SortDirection.DESC
  }
  
  /**
   * Reset pagination to first page
   */
  const resetPagination = () => {
    page.value = 1
  }
  
  /**
   * Go to next page
   */
  const nextPage = () => {
    page.value++
  }
  
  /**
   * Go to previous page
   */
  const prevPage = () => {
    if (page.value > 1) {
      page.value--
    }
  }
  
  /**
   * Go to specific page
   */
  const goToPage = (newPage: number) => {
    if (newPage >= 1) {
      page.value = newPage
    }
  }
  
  /**
   * Set page size
   */
  const setPageSize = (newLength: number) => {
    length.value = Math.min(newLength, MEDIA_CONSTANTS.MAX_PAGE_SIZE)
    resetPagination()
  }
  
  /**
   * Update search query and reset pagination
   */
  const setSearch = (query: string) => {
    searchQuery.value = query
    resetPagination()
  }
  
  /**
   * Update access level filter
   */
  const setAccessLevel = (level: AccessLevel | '') => {
    accessLevel.value = level
    resetPagination()
  }
  
  /**
   * Update collection filter
   */
  const setCollection = (collection: CollectionType | '') => {
    collectionName.value = collection
    resetPagination()
  }
  
  /**
   * Update MIME type filter
   */
  const setMimeType = (type: string) => {
    mimeType.value = type
    resetPagination()
  }
  
  /**
   * Update model filters
   */
  const setModel = (type: string, id: string) => {
    modelType.value = type
    modelId.value = id
    resetPagination()
  }
  
  /**
   * Update sort parameters
   */
  const setSort = (field: SortField, direction: SortDirection) => {
    sortBy.value = field
    sortDir.value = direction
    resetPagination()
  }
  
  /**
   * Get query DTO for API calls
   */
  const queryDto = computed((): MediaQueryDto => {
    const dto: MediaQueryDto = {
      page: page.value,
      length: length.value,
      sort_by: sortBy.value,
      sort_dir: sortDir.value
    }
    
    // Only include non-empty values
    if (searchQuery.value.trim()) {
      dto.search = searchQuery.value.trim()
    }
    
    if (accessLevel.value) {
      dto.accessLevel = accessLevel.value
    }
    
    if (collectionName.value) {
      dto.collectionName = collectionName.value
    }
    
    if (mimeType.value) {
      dto.mimeType = mimeType.value
    }
    
    if (modelType.value) {
      dto.modelType = modelType.value
    }
    
    if (modelId.value) {
      dto.modelId = modelId.value
    }
    
    return dto
  })
  
  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return !!(
      searchQuery.value.trim() ||
      accessLevel.value ||
      collectionName.value ||
      mimeType.value ||
      modelType.value ||
      modelId.value
    )
  })
  
  /**
   * Get filter summary for display
   */
  const filterSummary = computed(() => {
    const filters: string[] = []
    
    if (searchQuery.value.trim()) {
      filters.push(`Search: "${searchQuery.value.trim()}"`)
    }
    
    if (accessLevel.value) {
      filters.push(`Access: ${accessLevel.value}`)
    }
    
    if (collectionName.value) {
      filters.push(`Collection: ${collectionName.value}`)
    }
    
    if (mimeType.value) {
      filters.push(`Type: ${mimeType.value}`)
    }
    
    if (modelType.value) {
      filters.push(`Model: ${modelType.value}`)
    }
    
    return filters
  })
  
  return {
    // State
    searchQuery,
    accessLevel,
    collectionName,
    mimeType,
    modelType,
    modelId,
    page,
    length,
    sortBy,
    sortDir,
    
    // Computed
    queryDto,
    hasActiveFilters,
    filterSummary,
    
    // Actions
    resetFilters,
    resetPagination,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    setSearch,
    setAccessLevel,
    setCollection,
    setMimeType,
    setModel,
    setSort
  }
}

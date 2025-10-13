// Vue composables are auto-imported in Nuxt

export interface LoadingState {
  isLoading: boolean
  operation: string | null
  progress: number
  message: string
}

export function useMediaLoading() {
  const loadingStates = ref<Record<string, LoadingState>>({})
  
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state.isLoading)
  )
  
  const getLoadingState = (key: string): LoadingState => {
    return loadingStates.value[key] || {
      isLoading: false,
      operation: null,
      progress: 0,
      message: ''
    }
  }
  
  const setLoading = (key: string, isLoading: boolean, operation?: string, message?: string) => {
    if (!loadingStates.value[key]) {
      loadingStates.value[key] = {
        isLoading: false,
        operation: null,
        progress: 0,
        message: ''
      }
    }
    
    loadingStates.value[key] = {
      ...loadingStates.value[key],
      isLoading,
      operation: operation || null,
      message: message || '',
      progress: isLoading ? 0 : 100
    }
  }
  
  const setProgress = (key: string, progress: number, message?: string) => {
    if (loadingStates.value[key]) {
      loadingStates.value[key].progress = Math.max(0, Math.min(100, progress))
      if (message) {
        loadingStates.value[key].message = message
      }
    }
  }
  
  const setMessage = (key: string, message: string) => {
    if (loadingStates.value[key]) {
      loadingStates.value[key].message = message
    }
  }
  
  const clearLoading = (key: string) => {
    if (loadingStates.value[key]) {
      loadingStates.value[key] = {
        isLoading: false,
        operation: null,
        progress: 0,
        message: ''
      }
    }
  }
  
  const clearAllLoading = () => {
    loadingStates.value = {}
  }
  
  // Common loading operations
  const startUpload = (key: string = 'upload') => {
    setLoading(key, true, 'upload', 'Uploading files...')
  }
  
  const updateUploadProgress = (key: string, progress: number, filename?: string) => {
    setProgress(key, progress, filename ? `Uploading ${filename}...` : 'Uploading...')
  }
  
  const finishUpload = (key: string = 'upload') => {
    setLoading(key, false, 'upload', 'Upload complete')
    setTimeout(() => clearLoading(key), 1000)
  }
  
  const startFetch = (key: string = 'fetch') => {
    setLoading(key, true, 'fetch', 'Loading media...')
  }
  
  const finishFetch = (key: string = 'fetch') => {
    setLoading(key, false, 'fetch', '')
  }
  
  const startDelete = (key: string = 'delete') => {
    setLoading(key, true, 'delete', 'Deleting files...')
  }
  
  const finishDelete = (key: string = 'delete') => {
    setLoading(key, false, 'delete', 'Files deleted')
    setTimeout(() => clearLoading(key), 1000)
  }
  
  const startSearch = (key: string = 'search') => {
    setLoading(key, true, 'search', 'Searching...')
  }
  
  const finishSearch = (key: string = 'search') => {
    setLoading(key, false, 'search', '')
  }
  
  return {
    loadingStates: computed(() => loadingStates.value),
    isLoading,
    getLoadingState,
    setLoading,
    setProgress,
    setMessage,
    clearLoading,
    clearAllLoading,
    startUpload,
    updateUploadProgress,
    finishUpload,
    startFetch,
    finishFetch,
    startDelete,
    finishDelete,
    startSearch,
    finishSearch
  }
}

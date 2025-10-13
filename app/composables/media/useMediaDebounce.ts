import type { Ref } from 'vue'

export interface DebounceOptions {
  delay?: number
  immediate?: boolean
  maxWait?: number
}

export function useMediaDebounce<T>(
  source: Ref<T>,
  callback: (value: T) => void,
  options: DebounceOptions = {}
) {
  const {
    delay = 300,
    immediate = false,
    maxWait = 1000
  } = options

  const debouncedValue = ref<T>(source.value)
  const isPending = ref(false)
  const lastCallTime = ref(0)
  const maxWaitTimer = ref<NodeJS.Timeout>()

  let debounceTimer: NodeJS.Timeout | null = null

  const executeCallback = (value: T) => {
    isPending.value = false
    debouncedValue.value = value
    callback(value)
  }

  const debouncedCallback = (value: T) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime.value

    // Clear existing timers
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    if (maxWaitTimer.value) {
      clearTimeout(maxWaitTimer.value)
    }

    // Execute immediately if it's the first call and immediate is true
    if (immediate && lastCallTime.value === 0) {
      executeCallback(value)
      lastCallTime.value = now
      return
    }

    // Execute if maxWait time has passed
    if (timeSinceLastCall >= maxWait) {
      executeCallback(value)
      lastCallTime.value = now
      return
    }

    // Set up debounce timer
    debounceTimer = setTimeout(() => {
      executeCallback(value)
      lastCallTime.value = Date.now()
    }, delay)

    // Set up max wait timer
    maxWaitTimer.value = setTimeout(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        executeCallback(value)
        lastCallTime.value = Date.now()
      }
    }, maxWait)

    isPending.value = true
  }

  // Watch source changes
  watch(
    source,
    (newValue) => {
      debouncedCallback(newValue)
    },
    { immediate }
  )

  const cancel = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (maxWaitTimer.value) {
      clearTimeout(maxWaitTimer.value)
      maxWaitTimer.value = undefined
    }
    isPending.value = false
  }

  const flush = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      executeCallback(source.value)
      lastCallTime.value = Date.now()
    }
  }

  return {
    debouncedValue: readonly(debouncedValue),
    isPending: readonly(isPending),
    cancel,
    flush
  }
}

export function useMediaDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  options: Omit<DebounceOptions, 'delay'> = {}
) {
  const { immediate = false, maxWait = 1000 } = options
  
  let debounceTimer: NodeJS.Timeout | null = null
  let maxWaitTimer: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let lastArgs: Parameters<T> | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    lastArgs = args

    // Clear existing timers
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    if (maxWaitTimer) {
      clearTimeout(maxWaitTimer)
    }

    // Execute immediately if it's the first call and immediate is true
    if (immediate && lastCallTime === 0) {
      const result = fn(...args)
      lastCallTime = now
      return result
    }

    // Execute if maxWait time has passed
    if (timeSinceLastCall >= maxWait) {
      const result = fn(...args)
      lastCallTime = now
      return result
    }

    // Set up debounce timer
    debounceTimer = setTimeout(() => {
      if (lastArgs) {
        fn(...lastArgs)
        lastCallTime = Date.now()
      }
    }, delay)

    // Set up max wait timer
    maxWaitTimer = setTimeout(() => {
      if (debounceTimer && lastArgs) {
        clearTimeout(debounceTimer)
        fn(...lastArgs)
        lastCallTime = Date.now()
      }
    }, maxWait)
  }) as T & { cancel: () => void; flush: () => void }

  debouncedFn.cancel = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (maxWaitTimer) {
      clearTimeout(maxWaitTimer)
      maxWaitTimer = null
    }
  }

  debouncedFn.flush = () => {
    if (debounceTimer && lastArgs) {
      clearTimeout(debounceTimer)
      fn(...lastArgs)
      lastCallTime = Date.now()
    }
  }

  return debouncedFn
}

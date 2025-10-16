<template>
    <div
        ref="imageRef"
        :class="[
            'relative overflow-hidden',
            className,
        ]"
        :style="containerStyle"
    >
        <!-- Placeholder while loading -->
        <div
            v-if="!isLoaded && !isFailed"
            :class="[
                'absolute inset-0 flex items-center justify-center bg-muted',
                'animate-pulse',
            ]"
        >
            <Icon
                name="solar:image-outline"
                class="w-8 h-8 text-muted-foreground"
            />
        </div>

        <!-- Error state -->
        <div
            v-else-if="isFailed"
            :class="[
                'absolute inset-0 flex items-center justify-center bg-destructive/10',
                'text-destructive',
            ]"
        >
            <div class="text-center">
                <Icon
                    name="solar:image-broken-outline"
                    class="w-8 h-8 mx-auto mb-2"
                />
                <p class="text-sm">
                    Failed to load
                </p>
            </div>
        </div>

        <!-- Actual image -->
        <img
            v-if="isLoaded"
            :src="src"
            :alt="alt"
            :class="[
                'w-full h-full object-cover transition-opacity duration-300',
                imageClassName,
            ]"
            :style="imageStyle"
            @load="handleLoad"
            @error="handleError"
        >

        <!-- Loading overlay -->
        <div
            v-if="isLoading"
            :class="[
                'absolute inset-0 flex items-center justify-center bg-background/80',
                'backdrop-blur-sm',
            ]"
        >
            <div class="flex items-center gap-2">
                <Icon
                    name="solar:refresh-outline"
                    class="w-4 h-4 animate-spin"
                />
                <span class="text-sm">Loading...</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Vue composables are auto-imported in Nuxt
import { useMediaLazyLoading } from '~/composables/media';

interface Props {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
    imageClassName?: string;
    containerStyle?: Record<string, any>;
    imageStyle?: Record<string, any>;
    lazy?: boolean;
    threshold?: number;
    rootMargin?: string;
}

const props = withDefaults(defineProps<Props>(), {
    alt: '',
    width: 200,
    height: 200,
    className: '',
    imageClassName: '',
    containerStyle: () => ({}),
    imageStyle: () => ({}),
    lazy: true,
    threshold: 0.1,
    rootMargin: '50px',
});

const emit = defineEmits<{
    load: [event: Event];
    error: [event: Event];
}>();

const imageRef = ref<HTMLElement>();
const isLoaded = ref(false);
const isFailed = ref(false);
const isLoading = ref(false);

const {
    isImageLoaded,
    isImageLoading,
    isImageFailed,
    loadImage,
    observeElement,
    unobserveElement,
    getImagePlaceholder,
    getErrorPlaceholder,
} = useMediaLazyLoading({
    threshold: props.threshold,
    rootMargin: props.rootMargin,
});

const handleLoad = (event: Event) => {
    isLoaded.value = true;
    isLoading.value = false;
    emit('load', event);
};

const handleError = (event: Event) => {
    isFailed.value = true;
    isLoading.value = false;
    emit('error', event);
};

const loadImageSrc = async () => {
    if (isLoaded.value || isFailed.value) return;

    isLoading.value = true;

    try {
        await loadImage(props.src);
        isLoaded.value = true;
    }
    catch (error) {
        isFailed.value = true;
    }
    finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (props.lazy && imageRef.value) {
        observeElement(imageRef.value, loadImageSrc);
    }
    else {
        loadImageSrc();
    }
});

onUnmounted(() => {
    if (imageRef.value) {
        unobserveElement(imageRef.value);
    }
});

// Watch for src changes
watch(() => props.src, (newSrc) => {
    if (newSrc && newSrc !== props.src) {
        isLoaded.value = false;
        isFailed.value = false;
        isLoading.value = false;

        if (props.lazy && imageRef.value) {
            observeElement(imageRef.value, loadImageSrc);
        }
        else {
            loadImageSrc();
        }
    }
});
</script>

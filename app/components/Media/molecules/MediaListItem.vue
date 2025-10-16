<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index';
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage';
import { isImageFile } from '~/types/media/index';

interface Props {
    media: MediaEntity;
    selected?: boolean;
    selectable?: boolean;
    showActions?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    selected: false,
    selectable: true,
    showActions: false,
    class: '',
});

const emit = defineEmits<{
    select: [media: MediaEntity];
    deselect: [media: MediaEntity];
    edit: [media: MediaEntity];
    delete: [media: MediaEntity];
}>();

const { getDirectImageSrc } = useAuthenticatedImage();

const isImage = computed(() => isImageFile(props.media.mimeType));

const imageSrc = computed(() => {
    if (isImage.value) {
        return getDirectImageSrc(props.media);
    }
    return null;
});

const handleClick = () => {
    if (!props.selectable) return;

    if (props.selected) {
        emit('deselect', props.media);
    }
    else {
        emit('select', props.media);
    }
};

const handleEdit = (event: Event) => {
    event.stopPropagation();
    emit('edit', props.media);
};

const handleDelete = (event: Event) => {
    event.stopPropagation();
    emit('delete', props.media);
};
</script>

<template>
    <div
        :class="[
            'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover-lift',
            'bg-card/50 backdrop-blur-sm shadow-premium',
            selected ? 'border-primary ring-2 ring-primary/20 shadow-premium-lg' : 'border-border hover:border-primary/50',
            selectable ? 'cursor-pointer' : '',
            props.class,
        ]"
        @click="handleClick"
    >
        <!-- Thumbnail -->
        <div class="relative">
            <div class="w-12 h-12 rounded-lg overflow-hidden border border-border">
                <NuxtImg
                    v-if="isImage && imageSrc"
                    :src="imageSrc"
                    :alt="media.altText || media.filename"
                    class="w-full h-full object-cover"
                    loading="lazy"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-muted"
                >
                    <MediaIcon
                        :mime-type="media.mimeType"
                        size="sm"
                        class="text-muted-foreground"
                    />
                </div>
            </div>

            <!-- Selection indicator -->
            <div
                v-if="selected"
                class="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
            >
                <Icon
                    name="solar:check-circle-bold"
                    class="w-3 h-3 text-primary-foreground"
                />
            </div>
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <h4 class="font-medium text-sm truncate">
                    {{ media.filename }}
                </h4>
                <MediaBadge
                    :access-level="media.accessLevel"
                    size="sm"
                />
            </div>

            <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <MediaSize :size="media.size" />
                <MediaDate :date="media.createdAt" />
                <span
                    v-if="media.collectionName"
                    class="capitalize"
                >
                    {{ media.collectionName }}
                </span>
            </div>

            <div
                v-if="media.title || media.description"
                class="mt-1"
            >
                <p
                    v-if="media.title"
                    class="text-xs text-muted-foreground truncate"
                >
                    {{ media.title }}
                </p>
                <p
                    v-if="media.description"
                    class="text-xs text-muted-foreground truncate"
                >
                    {{ media.description }}
                </p>
            </div>
        </div>

        <!-- Action buttons -->
        <div
            v-if="showActions"
            class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
            <Button
                size="sm"
                variant="ghost"
                class="h-8 w-8 p-0"
                @click="handleEdit"
            >
                <Icon
                    name="solar:pen-outline"
                    class="w-4 h-4"
                />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                @click="handleDelete"
            >
                <Icon
                    name="solar:trash-bin-minimalistic-outline"
                    class="w-4 h-4"
                />
            </Button>
        </div>
    </div>
</template>

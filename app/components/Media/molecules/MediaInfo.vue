<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index';

interface Props {
    media: MediaEntity;
    showAccessLevel?: boolean;
    showCollection?: boolean;
    showMetadata?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    showAccessLevel: true,
    showCollection: true,
    showMetadata: true,
    class: '',
});

const { t } = useI18n();
</script>

<template>
    <div :class="['space-y-3', props.class]">
        <!-- Basic info -->
        <div class="space-y-2">
            <h3 class="font-semibold text-lg">
                {{ media.filename }}
            </h3>

            <div
                v-if="media.title"
                class="text-sm text-muted-foreground"
            >
                <strong>{{ t('media.title') }}:</strong> {{ media.title }}
            </div>

            <div
                v-if="media.description"
                class="text-sm text-muted-foreground"
            >
                <strong>{{ t('media.description') }}:</strong> {{ media.description }}
            </div>

            <div
                v-if="media.altText"
                class="text-sm text-muted-foreground"
            >
                <strong>{{ t('media.alt_text') }}:</strong> {{ media.altText }}
            </div>
        </div>

        <!-- File details -->
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
                <strong>{{ t('media.file_type') }}:</strong>
                <span class="ml-2">{{ media.mimeType }}</span>
            </div>

            <div>
                <strong>{{ t('media.file_size') }}:</strong>
                <MediaSize
                    :size="media.size"
                    class="ml-2"
                    :show-icon="false"
                />
            </div>

            <div v-if="media.width && media.height">
                <strong>{{ t('media.dimensions') }}:</strong>
                <span class="ml-2">{{ media.width }} × {{ media.height }}px</span>
            </div>

            <div v-if="media.duration">
                <strong>{{ t('media.duration') }}:</strong>
                <span class="ml-2">{{ Math.round(media.duration) }}s</span>
            </div>
        </div>

        <!-- Access and collection info -->
        <div
            v-if="showAccessLevel || showCollection"
            class="flex items-center gap-4"
        >
            <MediaBadge
                v-if="showAccessLevel"
                :access-level="media.accessLevel"
                size="md"
            />

            <div
                v-if="showCollection && media.collectionName"
                class="text-sm text-muted-foreground"
            >
                <strong>{{ t('media.collection') }}:</strong>
                <span class="ml-1 capitalize">{{ media.collectionName }}</span>
            </div>
        </div>

        <!-- Metadata -->
        <div
            v-if="showMetadata && Object.keys(media.metadata).length > 0"
            class="space-y-2"
        >
            <h4 class="font-medium text-sm">
                {{ t('media.metadata') }}
            </h4>
            <div class="bg-muted/50 rounded-lg p-3 text-xs">
                <pre class="whitespace-pre-wrap">{{ JSON.stringify(media.metadata, null, 2) }}</pre>
            </div>
        </div>

        <!-- Timestamps -->
        <div class="text-xs text-muted-foreground space-y-1">
            <div>
                <strong>{{ t('media.created_at') }}:</strong>
                <MediaDate
                    :date="media.createdAt"
                    format="absolute"
                    class="ml-2"
                    :show-icon="false"
                />
            </div>

            <div v-if="media.updatedAt !== media.createdAt">
                <strong>{{ t('media.updated_at') }}:</strong>
                <MediaDate
                    :date="media.updatedAt"
                    format="absolute"
                    class="ml-2"
                    :show-icon="false"
                />
            </div>
        </div>
    </div>
</template>

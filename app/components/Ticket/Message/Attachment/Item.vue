<!--
  TicketMessageAttachmentItem Component

  A reusable component for displaying individual ticket attachment items.

  Props:
  - attachment: Attachment - The attachment object to display

  Features:
  - Displays file thumbnail or icon based on file type
  - Shows file information (name, size, type)
  - Handles click events for preview/download
  - Responsive design with hover effects
-->

<template>
    <li
        class="flex items-center gap-4 py-2 grow w-full cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
        @click="handleClick"
    >
        <!-- Thumbnail or Icon -->
        <div class="flex-shrink-0">
            <div
                v-if="attachment.properties?.isImage"
                class="size-10 rounded-lg border bg-muted overflow-hidden flex items-center justify-center"
            >
                <img
                    :src="attachment.urls?.thumbnail"
                    :alt="attachment.name"
                    class="object-cover w-full h-full"
                    loading="lazy"
                >
            </div>
            <div
                v-else
                class="size-10 rounded-lg border bg-muted flex items-center justify-center"
            >
                <Icon
                    :name="fileIcon"
                    class="size-6 text-muted-foreground"
                />
            </div>
        </div>

        <!-- File Info -->
        <div class="flex-grow min-w-0">
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-foreground truncate">
                    {{ attachment.fileName || attachment.name }}
                </span>
                <span class="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {{ attachment.humanSize }}
                </span>
            </div>
            <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-muted-foreground">
                    {{ attachment.properties?.extension?.toUpperCase() }}
                </span>
                <span class="text-xs text-muted-foreground">
                    {{ fileTypeLabel }}
                </span>
            </div>
        </div>

        <!-- Action Icon -->
        <div class="flex-shrink-0">
            <Icon
                :name="actionIcon"
                class="!size-5 shrink-0 text-muted-foreground"
            />
        </div>
    </li>
</template>

<script lang="ts" setup>
import type { Attachment } from '~/types';

const props = defineProps<{
    attachment: Attachment;
}>();

// Use the file icon composable
const { getFileIcon, getFileTypeLabel, getActionIcon, handleAttachmentClick } = useFileIcon();

// Computed properties for better performance
const fileIcon = computed(() => getFileIcon(props.attachment));
const fileTypeLabel = computed(() => getFileTypeLabel(props.attachment));
const actionIcon = computed(() => getActionIcon(props.attachment));

// Handle click event
const handleClick = () => {
    handleAttachmentClick(props.attachment);
};
</script>

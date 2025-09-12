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
        v-if="isImage"
        class="size-10 rounded-lg border bg-muted overflow-hidden flex items-center justify-center"
      >
        <img
          :src="attachment.url"
          :alt="attachment.filename"
          class="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      <div
        v-else
        class="size-10 rounded-lg border bg-muted flex items-center justify-center"
      >
        <Icon :name="fileIcon" class="size-6 text-muted-foreground" />
      </div>
    </div>

    <!-- File Info -->
    <div class="flex-grow min-w-0">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-foreground truncate">
          {{ attachment.filename }}
        </span>
        <span class="text-xs text-muted-foreground ml-2 flex-shrink-0">
          {{ formatFileSize(parseInt(attachment.size)) }}
        </span>
      </div>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-xs text-muted-foreground">
          {{ getFileExtension(attachment.filename)?.toUpperCase() }}
        </span>
        <span class="text-xs text-muted-foreground">
          {{ fileTypeLabel }}
        </span>
      </div>
    </div>

    <!-- Action Icon -->
    <div class="flex-shrink-0">
      <Icon :name="actionIcon" class="!size-5 shrink-0 text-muted-foreground" />
    </div>
  </li>
</template>

<script lang="ts" setup>
import type { TicketAttachment } from "~/types";

const props = defineProps<{
  attachment: TicketAttachment;
}>();

// Use the file icon composable
const {
  getFileIcon,
  getFileTypeLabel,
  getActionIcon,
  handleAttachmentClick,
} = useFileIcon();

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to get file extension
const getFileExtension = (filename: string): string | undefined => {
  return filename.split(".").pop();
};

// Check if file is an image
const isImage = computed(() => {
  return props.attachment.mimeType?.startsWith('image/') || false;
});

// Computed properties for better performance
const fileIcon = computed(() => getFileIcon(props.attachment));
const fileTypeLabel = computed(() => getFileTypeLabel(props.attachment));
const actionIcon = computed(() => getActionIcon(props.attachment));

// Handle click event
const handleClick = () => {
  handleAttachmentClick(props.attachment);
};
</script>

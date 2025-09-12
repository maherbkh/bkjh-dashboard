<template>
  <div v-if="attachments && attachments.length > 0">
    <!-- Attachment Count Summary -->
    <div class="flex items-center gap-2 mt-3 border-t pt-3 border-dashed">
      <Icon name="solar:cloud-upload-line-duotone" class="!size-5 opacity-75 shrink-0" />
      <span class="text-sm text-muted-foreground">
        <span class="font-bold">{{ attachments.length }}</span> Attachments
      </span>
    </div>

    <!-- Attachment List -->
    <ul
      class="flex flex-col items-start gap-2 divide-y divide-dashed border rounded-xl p-4 mt-3 bg-muted/50"
    >
      <TicketMessageAttachmentItem
        v-for="attachment in attachments"
        :key="attachment.id"
        :attachment="attachment"
      />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { TicketAttachment } from "~/types";

defineProps<{ attachments?: TicketAttachment[] }>();
</script>

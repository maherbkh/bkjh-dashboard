<!--
  TicketMessage Component

  A reusable component for displaying ticket messages with attachments.

  Props:
  - message: string - The ticket message text
  - attachments?: Attachment[] - Optional array of file attachments

  Features:
  - Displays message text with proper formatting
  - Shows attachment count and list
  - Handles different file types with appropriate icons
  - Supports image previews and file downloads
  - Responsive design with hover effects
-->

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <Icon
                    name="solar:chat-round-outline"
                    class="!size-5 opacity-75 shrink-0"
                />
                {{ $t('tickets.show.message') }}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p class="whitespace-pre-wrap font-mono">
                {{ message }}
            </p>

            <!-- Attachment List Component -->
            <TicketMessageAttachmentList :attachments="attachments" />
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import type { Attachment } from '~/types';

defineProps<{ message: string; attachments?: Attachment[] }>();
</script>

<!--
  TicketInfoCard Component

  Displays basic ticket information (type, created at, updated at).

  Props:
  - ticket: SupportTicket - The ticket object
-->

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <Icon
                    name="solar:info-circle-outline"
                    class="!size-5 opacity-75 shrink-0"
                />
                {{ $t("common.information") }}
            </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col divide-y divide-dashed">
            <AppListItem
                :title="$t('type.singular')"
                :value="ticket.type"
            />
            <AppListItem
                :title="$t('common.created_at')"
                :value="formatDate(ticket.createdAt)"
            />
            <AppListItem
                :title="$t('common.updated_at')"
                :value="formatDate(ticket.updatedAt)"
            />
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import type { SupportTicket } from '~/types';

defineProps<{
    ticket: SupportTicket;
}>();

const { formatDate } = useGermanDateFormat();
</script>

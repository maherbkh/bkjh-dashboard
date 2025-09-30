<!--
  TicketContactCard Component

  Displays contact information for the ticket requester.

  Props:
  - ticket: SupportTicket - The ticket object
-->

<template>
    <Card>
        <CardHeader>
            <CardTitle>
                <Icon
                    name="solar:user-outline"
                    class="!size-5 opacity-75 shrink-0"
                />
                {{ $t("form.contact_information") }}
            </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col divide-y divide-dashed">
            <AppListItem
                :title="$t('requester.singular')"
                :value="ticket.requester.name"
            />
            <AppListItem
                :title="$t('form.email')"
                :value="ticket.requester.email"
            />
            <AppListItem
                :title="$t('form.phone')"
                :value="ticket.requester.phone"
            />
            <AppListItem
                :title="$t('form.cell')"
                :value="ticket.requester.cell"
            />
            <AppListItem
                :title="$t('form.device_id')"
                :value="ticket.deviceId"
            />
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import type { SupportTicket } from '~/types';

defineProps<{
    ticket: SupportTicket;
}>();
</script>

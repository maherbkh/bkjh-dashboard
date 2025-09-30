<!--
  TicketAssignmentCard Component

  Displays assignment information (category, group, admin).

  Props:
  - ticket: SupportTicket - The ticket object
-->

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <Icon
                    name="solar:users-group-rounded-outline"
                    class="!size-5 opacity-75 shrink-0"
                />
                {{ $t("form.assignment_information") }}
            </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col divide-y divide-dashed">
            <AppListItem
                :title="$t('category.singular')"
                :value="ticket.ticketCategory?.name"
            />

            <AppListItem
                :title="$t('group.singular')"
                :value="ticket.group?.name"
            />

            <AppListItem
                :title="$t('admin.singular')"
                :value="
                    ticket.admin ? `${ticket.admin.firstName} ${ticket.admin.lastName}` : ''
                "
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

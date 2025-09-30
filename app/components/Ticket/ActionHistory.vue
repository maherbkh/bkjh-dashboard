<!--
  TicketActionHistory Component

  Displays the ticket's action history in a table format.

  Props:
  - actions: TicketAction[] - Array of ticket actions
-->

<template>
    <div v-if="actions && actions.length > 0">
        <PageTable
            :header-items="actionHistoryHeaders"
            :rows="sortedActionsHistory"
            :selected-rows="[]"
            :loading="false"
            :selectable="false"
            :sortable="false"
        >
            <template #cell-actionType="{ row }">
                <Badge variant="secondary">
                    {{ $t(`action.types.${row.actionType}`) }}
                </Badge>
            </template>

            <template #cell-user="{ row }">
                <div
                    v-if="row.issuer"
                    class="font-medium"
                >
                    <div>{{ row.issuer.firstName }} {{ row.issuer.lastName }}</div>
                </div>
                <div v-else>
                    —
                </div>
            </template>
            
            <template #cell-targetUser="{ row }">
                <div
                    v-if="row.target && isAssignmentAction(row.actionType)"
                    class="text-sm"
                >
                    <div>{{ row.target.firstName }} {{ row.target.lastName }}</div>
                </div>
                <div v-else>
                    —
                </div>
            </template>

            <template #cell-note="{ row }">
                <div
                    v-if="row.note"
                    class="text-sm text-muted-foreground"
                >
                    <HoverCard v-if="row.note">
                        <HoverCardTrigger
                            class="line-clamp-2 max-w-64 cursor-pointer hover:text-primary ease-in-out duration-300"
                        >
                            {{ row.note }}
                        </HoverCardTrigger>
                        <HoverCardContent side="right">
                            {{ row.note }}
                        </HoverCardContent>
                    </HoverCard>
                </div>
                <div v-else>
                    —
                </div>
            </template>

            <template #cell-createdAt="{ row }">
                <span class="text-sm text-muted-foreground">
                    {{ formatDate(row.createdAt) }}
                </span>
            </template>
        </PageTable>
    </div>
    <div
        v-else
        class="text-center py-4 text-muted-foreground"
    >
        {{ $t("common.no_action_history") }}
    </div>
</template>

<script lang="ts" setup>
import type { TicketAction } from '~/types';

const props = defineProps<{
    actions: TicketAction[];
}>();

const { t } = useI18n();
const { formatDate } = useGermanDateFormat();

// Action types that require a target admin
const ASSIGNMENT_ACTION_TYPES = ['ASSIGN', 'REASSIGN', 'UNASSIGN', 'TEMPORARY_ASSIGN', 'TRANSFER'];

// Helper function to check if an action type requires a target
const isAssignmentAction = (actionType: string) => {
    return ASSIGNMENT_ACTION_TYPES.includes(actionType.toUpperCase());
};

// Action history table configuration
const actionHistoryHeaders = computed(() => [
    {
        as: 'th' as const,
        name: t('action.type'),
        id: 'actionType',
    },
    {
        as: 'th' as const,
        name: t('action.by'),
        id: 'user',
    },
    {
        as: 'th' as const,
        name: t('action.assigned_to'),
        id: 'targetUser',
    },
    {
        as: 'th' as const,
        name: t('note.singular'),
        id: 'note',
    },
    {
        as: 'th' as const,
        name: t('common.created_at'),
        id: 'createdAt',
    },
]);

const sortedActionsHistory = computed(() => {
    if (!props.actions) return [];
    return [...props.actions].sort(
        (a: TicketAction, b: TicketAction) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
});
</script>

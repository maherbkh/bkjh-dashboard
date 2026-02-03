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
            :has-actions-slot="false"
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
                            <div v-html="formatActionNote(row.note, row.actionType)" />
                        </HoverCardTrigger>
                        <HoverCardContent
                            side="right"
                            class="max-w-4xl"
                        >
                            <div
                                class="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:bg-muted [&_pre]:p-2 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:bg-muted [&_pre_code]:bg-transparent [&_pre_code]:p-0"
                                v-html="formatActionNote(row.note, row.actionType)"
                            />
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

// Format action note - translate status change messages while preserving note values
const formatActionNote = (note: string, actionType: string): string => {
    // Only process STATUS_CHANGE actions
    if (actionType !== 'STATUS_CHANGE') {
        return note;
    }

    // Pattern: "Status Changed to {STATUS} with note "{NOTE_VALUE}""
    const statusChangePattern = /^Status Changed to ([A-Z_]+) with note "([^"]*)"$/;
    const match = note.match(statusChangePattern);

    if (match) {
        const [, status, noteValue] = match;
        // Translate the status name
        const translatedStatus = t(`ticket.status.${status.toLowerCase()}`);
        // Reconstruct with translated status, keeping the note value unchanged
        return t('action.message.status_changed_with_note', {
            status: translatedStatus,
            note: noteValue,
        });
    }

    // Pattern: "Status Changed to {STATUS}" (without note)
    const statusChangeWithoutNotePattern = /^Status Changed to ([A-Z_]+)$/;
    const matchWithoutNote = note.match(statusChangeWithoutNotePattern);

    if (matchWithoutNote) {
        const [, status] = matchWithoutNote;
        const translatedStatus = t(`ticket.status.${status.toLowerCase()}`);
        return t('action.message.status_changed', { status: translatedStatus });
    }

    // If pattern doesn't match, return original note
    return note;
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

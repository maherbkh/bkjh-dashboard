<!--
  TicketHeader Component

  Displays ticket header with ticket number, status, requester info, and action buttons.

  Props:
  - ticket: SupportTicket - The ticket object
  - isActionLoading: boolean - Whether an action is currently loading
  
  Emits:
  - assignSelf: Triggered when self-assign button is clicked
  - actionSelect: Triggered when an action type is selected from dropdown
  - transferSelect: Triggered when transfer action is selected
-->

<template>
    <div class="flex lg:flex-row flex-col gap-5 lg:items-center justify-between">
        <div class="flex items-start gap-4">
            <Icon
                :name="pageIcon || 'solar:ticket-outline'"
                class="!size-5 shrink-0 opacity-75 mt-1"
            />
            <div>
                <div class="text-lg font-bold flex items-center gap-4">
                    {{ ticket.ticketNumber }}
                    <Badge
                        :variant="
                            getStatusVariant(getLatestStatus(ticket.statuses)?.status || 'PENDING')
                        "
                    >
                        {{
                            $t(
                                `common.${getLatestStatus(
                                    ticket.statuses,
                                )?.status?.toLowerCase()}`,
                            )
                        }}
                    </Badge>
                </div>
                <div class="mt-1 text-muted-foreground flex items-center gap-2">
                    <div class="text-sm">
                        {{ ticket.requester.name }}
                    </div>
                    <template v-if="ticket.group">
                        <Icon
                            name="solar:arrow-right-line-duotone"
                            class="!size-5 shrink-0 opacity-75"
                        />
                        <Badge variant="outline">
                            {{ ticket.group?.name }}
                        </Badge>
                    </template>
                    <template v-else>
                        <Icon
                            name="solar:arrow-right-line-duotone"
                            class="!size-5 shrink-0 opacity-75"
                        />
                        <Badge variant="outline">
                            no group
                        </Badge>
                    </template>
                </div>
            </div>
        </div>
        <div class="flex lg:flex-row flex-col items-center gap-5">
            <!-- Self-Assign Button for TICKET type -->
            <Button
                v-if="ticket.type === 'TICKET'"
                class="lg:w-fit w-full"
                variant="default"
                size="sm"
                :disabled="isActionLoading"
                @click="$emit('assignSelf')"
            >
                <Icon
                    v-if="isActionLoading"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                <Icon
                    v-else
                    name="solar:add-circle-outline"
                    class="mr-2 h-4 w-4"
                />
                {{ $t("action.self_assign") }}
            </Button>
            
            <!-- Actions Dropdown for TASK type -->
            <DropdownMenu v-else>
                <DropdownMenuTrigger class="lg:w-fit w-full">
                    <Button
                        class="group lg:w-fit w-full"
                        :title="$t('common.more')"
                        variant="default"
                        :disabled="isActionLoading"
                    >
                        <Icon
                            name="solar:folder-path-connect-line-duotone"
                            class="shrink-0"
                        />
                        Actions
                        <Icon
                            name="solar:double-alt-arrow-down-line-duotone"
                            class="ml-2 h-4 w-4 group-hover:rotate-90 ease-in-out duration-300"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    class="w-56"
                >
                    <!-- Assignment Actions -->
                    <DropdownMenuLabel>{{ $t("action.groups.assignment") }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="$emit('transferSelect')">
                        <Icon
                            name="solar:transfer-horizontal-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.TRANSFER") }}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <!-- Hardware Actions -->
                    <DropdownMenuLabel>{{ $t("action.groups.hardware") }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="$emit('actionSelect', 'UPGRADE_HARDWARE')">
                        <Icon
                            name="solar:arrow-up-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.UPGRADE_HARDWARE") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'REPAIR_HARDWARE')">
                        <Icon
                            name="solar:sledgehammer-line-duotone"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.REPAIR_HARDWARE") }}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <!-- Software Actions -->
                    <DropdownMenuLabel>{{ $t("action.groups.software") }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="$emit('actionSelect', 'UPGRADE_SOFTWARE')">
                        <Icon
                            name="solar:arrow-up-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.UPGRADE_SOFTWARE") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'REPAIR_SOFTWARE')">
                        <Icon
                            name="solar:widget-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.REPAIR_SOFTWARE") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'INSTALL_SOFTWARE')">
                        <Icon
                            name="solar:download-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.INSTALL_SOFTWARE") }}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <!-- Maintenance Actions -->
                    <DropdownMenuLabel>{{ $t("action.groups.maintenance") }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="$emit('actionSelect', 'CLEAN')">
                        <Icon
                            name="solar:broom-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.CLEAN") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'BACKUP')">
                        <Icon
                            name="solar:cloud-upload-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.BACKUP") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'RESTORE')">
                        <Icon
                            name="solar:cloud-download-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.RESTORE") }}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <!-- Status Actions -->
                    <DropdownMenuLabel>{{ $t("action.groups.status") }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="$emit('actionSelect', 'MARK_OFF_DUTY')">
                        <Icon
                            name="solar:pause-circle-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.MARK_OFF_DUTY") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'RETURN_TO_INVENTORY')">
                        <Icon
                            name="solar:box-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.RETURN_TO_INVENTORY") }}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <!-- Support Actions -->
                    <DropdownMenuLabel>{{ $t("action.groups.support") }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="$emit('actionSelect', 'TROUBLESHOOT')">
                        <Icon
                            name="solar:bug-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.TROUBLESHOOT") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="$emit('actionSelect', 'RESET_PASSWORD')">
                        <Icon
                            name="solar:lock-password-outline"
                            class="shrink-0 mr-2"
                        />
                        {{ $t("action.types.RESET_PASSWORD") }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { SupportTicket, TicketStatus } from '~/types';

defineProps<{
    ticket: SupportTicket;
    isActionLoading: boolean;
}>();

defineEmits<{
    assignSelf: [];
    actionSelect: [actionType: string];
    transferSelect: [];
}>();

const pageIcon = usePageIcon();

// Helper function to get latest status
const getLatestStatus = (statuses: TicketStatus[]) => {
    if (!statuses || statuses.length === 0) return null;
    return statuses.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'secondary';
        case 'IN_PROGRESS':
            return 'default';
        case 'RESOLVED':
            return 'success';
        case 'CLOSED':
            return 'outline';
        case 'CANCELLED':
            return 'destructive';
        default:
            return 'secondary';
    }
};
</script>

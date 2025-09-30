<template>
    <div class="flex flex-col gap-6">
        <!-- Loading State -->
        <div
            v-if="isLoading"
            class="flex items-center justify-center py-12"
        >
            <Icon
                name="solar:refresh-linear"
                class="!size-8 shrink-0 animate-spin"
            />
            <span class="ml-2">{{ $t("global.loading") }}</span>
        </div>

        <!-- Ticket Not Found State -->
        <div
            v-else-if="isTicketNotFound"
            class="flex flex-col items-center justify-center py-16 text-center"
        >
            <div class="flex items-center justify-center size-20 rounded-full bg-muted mb-6">
                <Icon
                    name="solar:ticket-cross-outline"
                    class="!size-10 text-muted-foreground"
                />
            </div>
            <h2 class="text-2xl font-semibold text-foreground mb-2">
                {{ $t("action.message.not_found_title", { model: $t("ticket.singular") }) }}
            </h2>
            <p class="text-muted-foreground mb-6 max-w-md">
                {{ $t("action.message.not_found_description", { model: $t("ticket.singular") }) }}
            </p>
            <div class="flex items-center gap-3">
                <Button
                    variant="outline"
                    @click="refresh"
                >
                    <Icon
                        name="solar:refresh-linear"
                        class="mr-2 h-4 w-4"
                    />
                    {{ $t("action.retry") }}
                </Button>
                <NuxtLink :to="'/support-tickets'">
                    <Button>
                        <Icon
                            name="solar:arrow-left-linear"
                            class="mr-2 h-4 w-4"
                        />
                        {{ $t("action.back") + " " + $t("common.to") + " " + $t("ticket.plural") }}
                    </Button>
                </NuxtLink>
            </div>
        </div>

        <!-- Ticket Content -->
        <div
            v-else-if="ticket"
            class="space-y-6"
        >
            <!-- Header Component -->
            <TicketHeader
                :ticket="ticket"
                :is-action-loading="isActionLoading"
                @assign-self="assignSelf"
                @action-select="handleActionSelect"
                @transfer-select="handleTransferSelect"
            />

            <!-- Ticket Details Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <!-- Main Content -->
                <div class="xl:col-span-8 space-y-6">
                    <!-- Message Card -->
                    <TicketMessage
                        :message="ticket.message"
                        :attachments="ticket.attachments || []"
                    />

                    <!-- Comments Section -->
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {{ $t("comment.plural") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TicketComments
                                :ticket-id="ticket.id"
                                :comments="ticket.comments || []"
                                :refresh="refresh"
                            />
                        </CardContent>
                    </Card>

                    <!-- Action History Component -->
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {{ $t("action.history") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TicketActionHistory :actions="ticket.actions || []" />
                        </CardContent>
                    </Card>
                </div>

                <!-- Sidebar -->
                <div class="xl:col-span-4 space-y-6">
                    <!-- Ticket Information Card Component -->
                    <TicketInfoCard :ticket="ticket" />

                    <!-- Contact Information Card Component -->
                    <TicketContactCard :ticket="ticket" />

                    <!-- Assignment Information Card Component -->
                    <TicketAssignmentCard :ticket="ticket" />
                </div>
            </div>
        </div>

        <!-- Edit Dialog -->
        <LazyTicketFormDialog
            v-model:is-dialog-open="isEditDialogOpen"
            dialog-mode="edit"
            :editing-ticket="ticket"
            :is-submitting="isSubmitting"
            @submit-and-close="onEditSubmit"
            @close-dialog="handleEditDialogClose"
        />

        <!-- Transfer Dialog Component -->
        <TicketDialogsTransfer
            v-model:is-open="isTransferDialogOpen"
            v-model:transfer-user-id="transferUserId"
            :transfer-admins="transferAdmins"
            :loading-admins="loadingTransferAdmins"
            :is-action-loading="isActionLoading"
            @submit="submitTransfer"
        />

        <!-- Action Dialog Component -->
        <TicketDialogsAction
            v-model:is-open="isActionDialogOpen"
            v-model:action-note="actionNote"
            :selected-action-type="selectedActionType"
            :is-action-loading="isActionLoading"
            @submit="submitAction"
        />

    </div>
</template>

<script lang="ts" setup>
import { toast } from 'vue-sonner';

// Fetch ticket data
import type { SupportTicket } from '~/types';

const props = defineProps<{
    id: string;
}>();

const { t } = useI18n();
const { addOpenedTicket, removeOpenedTicket } = useOpenedTickets();
const route = useRoute();
const router = useRouter();

// Page configuration
const pageTitle = computed(() =>
    t('action.message.title', { model: t('ticket.singular') }),
);
const pageDescription = computed(() =>
    t('action.message.description', { model: t('ticket.singular') }),
);

// Fetch ticket data
const { data: ticketData, pending: isLoading, error, refresh } = useApiFetch<{
    status: boolean;
    message: string;
    data: SupportTicket;
}>(`/support/tickets/${props.id}`);

const ticket = computed(() => ticketData.value?.data as SupportTicket | undefined);

// Check if ticket is not found
const isTicketNotFound = computed(() => {
    return !isLoading.value && (error.value || !ticket.value);
});

// Store ticket in localStorage when data is available
watchEffect(() => {
    if (ticket.value && ticket.value.ticketNumber) {
        addOpenedTicket(props.id, ticket.value.ticketNumber);
    }
});

// Clean up when component is unmounted
onUnmounted(() => {
    removeOpenedTicket(props.id);
});

// Set page meta
useSeoMeta({
    title: computed(() => `${ticket.value?.ticketNumber} - ${pageTitle.value}`),
    ogTitle: computed(() => `${ticket.value?.ticketNumber} - ${pageTitle.value}`),
    description: pageDescription,
    ogDescription: pageDescription,
});

// Dialog state for editing
const isEditDialogOpen = ref(false);
const isSubmitting = ref(false);

// CRUD operations for editing
const { updateItem, resetForm, setValues } = useCrud<SupportTicket, any>({
    crudPath: 'tickets',
    tenant: 'support',
    formSchema: createTicketSchema(t),
});

const handleEdit = () => {
    if (!ticket.value) return;

    setValues({
        requester: {
            name: ticket.value.requester.name,
            email: ticket.value.requester.email,
            phone: ticket.value.requester.phone,
            cell: ticket.value.requester.cell,
        },
        groupId: ticket.value.groupId,
        ticketCategoryId: ticket.value.ticketCategoryId,
        message: ticket.value.message,
        type: ticket.value.type,
        adminId: ticket.value.adminId,
        deviceId: ticket.value.deviceId,
    });
    isEditDialogOpen.value = true;
};

const onEditSubmit = async (values: any) => {
    if (!ticket.value) return;

    isSubmitting.value = true;
    try {
        await updateItem(ticket.value.id, values);
        isEditDialogOpen.value = false;
        resetForm();
        // Refresh the page data
        await navigateTo(route.fullPath, { replace: true });
    }
    catch (error) {
        console.error('Error updating ticket:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

const handleEditDialogClose = () => {
    isEditDialogOpen.value = false;
    resetForm();
};

// Use ticket actions composable for all ticket actions
const { 
    isActionLoading, 
    assignSelf: assignSelfComposable, 
    transferTicket: transferTicketComposable, 
    addTicketAction: addTicketActionComposable,
} = useTicketActions();

// Wrapper functions to adapt the composable to component needs
const assignSelf = async () => {
    if (!ticket.value) return;
    await assignSelfComposable(ticket.value.id, refresh);
};

const transferTicket = async (userId: string) => {
    if (!ticket.value) return;
    await transferTicketComposable(ticket.value.id, userId, refresh);
};

const addTicketAction = async (actionType: string, note?: string) => {
    if (!ticket.value) return;
    await addTicketActionComposable(ticket.value.id, actionType, note, refresh);
};

// Dialog states for actions
const isTransferDialogOpen = ref(false);
const isActionDialogOpen = ref(false);
const selectedActionType = ref('');
const actionNote = ref('');
const transferUserId = ref<string | undefined>(undefined);

// Fetch admins for transfer dialog (exclude current user, only when dialog opens)
const { 
    admins: transferAdmins, 
    loadingAdmins: loadingTransferAdmins, 
    refreshAdmins: refreshTransferAdmins 
} = useAdminsList({
    showSelf: false,
    immediate: false,
});

// Fetch admins when transfer dialog opens
watch(() => isTransferDialogOpen.value, (isOpen) => {
    if (isOpen && transferAdmins.value.length === 0) {
        refreshTransferAdmins();
    }
});

// Available action types
const actionTypes = [
    'assign',
    'reassign',
    'unassign',
    'temporary_assign',
    'upgrade_hardware',
    'downgrade_hardware',
    'upgrade_software',
    'downgrade_software',
    'repair_hardware',
    'repair_software',
    'clean',
    'reconfigure',
    'change_network',
    'add_peripherals',
    'remove_peripherals',
    'install_software',
    'uninstall_software',
    'update_license',
    'decommission',
    'reactivate',
    'mark_off_duty',
    'return_to_inventory',
    'troubleshoot',
    'reset_password',
    'replace',
    'audit',
    'backup',
    'restore',
    'loan',
    'retrieve',
    'tag',
    'create',
    'status_change',
    'transfer',
];

// Handle action selection
const handleActionSelect = (actionType: string) => {
    selectedActionType.value = actionType;
    actionNote.value = '';
    isActionDialogOpen.value = true;
};

// Handle transfer dialog
const handleTransferSelect = () => {
    transferUserId.value = undefined;
    isTransferDialogOpen.value = true;
};

// Submit action with note
const submitAction = async () => {
    if (!selectedActionType.value) return;
    await addTicketAction(selectedActionType.value, actionNote.value);
    await refresh();
    isActionDialogOpen.value = false;
};

// Submit transfer
const submitTransfer = async () => {
    if (!transferUserId.value) return;
    await transferTicket(transferUserId.value);
    await refresh();
    isTransferDialogOpen.value = false;
};
</script>

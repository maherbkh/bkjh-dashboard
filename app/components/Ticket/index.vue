<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Icon name="solar:refresh-linear" class="!size-8 shrink-0 animate-spin" />
      <span class="ml-2">{{ $t("global.loading") }}</span>
    </div>

    <!-- Ticket Not Found State -->
    <div
      v-else-if="isTicketNotFound"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="flex items-center justify-center size-20 rounded-full bg-muted mb-6">
        <Icon name="solar:ticket-cross-outline" class="!size-10 text-muted-foreground" />
      </div>
      <h2 class="text-2xl font-semibold text-foreground mb-2">
        {{ $t("action.message.not_found_title", { model: $t("ticket.singular") }) }}
      </h2>
      <p class="text-muted-foreground mb-6 max-w-md">
        {{ $t("action.message.not_found_description", { model: $t("ticket.singular") }) }}
      </p>
      <div class="flex items-center gap-3">
        <Button variant="outline" @click="refresh">
          <Icon name="solar:refresh-linear" class="mr-2 h-4 w-4" />
          {{ $t("action.retry") }}
        </Button>
        <Button @click="() => router.push('/support-tickets')">
          <Icon name="solar:arrow-left-linear" class="mr-2 h-4 w-4" />
          {{ $t("action.back") + " " + $t("common.to") + " " + $t("ticket.plural") }}
        </Button>
      </div>
    </div>

    <!-- Ticket Content -->
    <div v-else-if="ticket" class="space-y-6">
      <!-- Header -->
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
                    `ticket.status.${getLatestStatus(
                      ticket.statuses
                    )?.status?.toLowerCase()}`
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
                <Badge variant="outline"> no group </Badge>
              </template>
            </div>
          </div>
        </div>
        <div class="flex lg:flex-row flex-col items-center gap-5">
          <Button class="lg:w-fit w-full" variant="outline" size="sm" @click="handleEdit">
            <Icon name="solar:pen-new-square-outline" class="mr-2 h-4 w-4" />
            {{ $t("action.edit") }}
          </Button>
          <Button class="lg:w-fit w-full"
            v-if="ticket.type === 'TICKET'"
            variant="default"
            size="sm"
            :disabled="isActionLoading"
            @click="assignSelf"
          >
            <Icon
              v-if="isActionLoading"
              name="solar:refresh-linear"
              class="mr-2 h-4 w-4 animate-spin"
            />
            <Icon v-else name="solar:add-circle-outline" class="mr-2 h-4 w-4" />
            {{ $t("action.self_assign") }}
          </Button>
          <DropdownMenu v-else>
            <DropdownMenuTrigger>
              <Button
                class="group"
                :title="$t('common.more')"
                variant="outline"
                :disabled="isActionLoading"
              >
                <Icon name="solar:folder-path-connect-line-duotone" class="shrink-0" />
                Actions
                <Icon
                  name="solar:double-alt-arrow-down-line-duotone"
                  class="ml-2 h-4 w-4 group-hover:rotate-90 ease-in-out duration-300"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuItem @click="handleTransferSelect">
                <Icon name="solar:user-plus-broken" class="shrink-0 mr-2" />
                Transfer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuItem @click="handleActionSelect('status_change')">
                <Icon name="solar:refresh-circle-outline" class="shrink-0 mr-2" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleActionSelect('troubleshoot')">
                <Icon name="solar:settings-outline" class="shrink-0 mr-2" />
                Troubleshoot
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Hardware Actions</DropdownMenuLabel>
              <DropdownMenuItem @click="handleActionSelect('repair_hardware')">
                <Icon name="solar:hammer-outline" class="shrink-0 mr-2" />
                Repair Hardware
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleActionSelect('replace')">
                <Icon name="solar:refresh-outline" class="shrink-0 mr-2" />
                Replace
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleActionSelect('clean')">
                <Icon name="solar:broom-outline" class="shrink-0 mr-2" />
                Clean
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Software Actions</DropdownMenuLabel>
              <DropdownMenuItem @click="handleActionSelect('install_software')">
                <Icon name="solar:download-outline" class="shrink-0 mr-2" />
                Install Software
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleActionSelect('upgrade_software')">
                <Icon name="solar:arrow-up-outline" class="shrink-0 mr-2" />
                Upgrade Software
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleActionSelect('backup')">
                <Icon name="solar:cloud-upload-outline" class="shrink-0 mr-2" />
                Backup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Ticket Details Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Main Content -->
        <div class="xl:col-span-9 space-y-6">
          <!-- Message Card -->
          <TicketMessage
            :message="ticket.message"
            :attachments="ticket.attachments || []"
          />

          <!-- Comment List -->
          <Card>
            <CardHeader>
              <CardTitle>
                {{ $t("comment.plural") }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentList :ticket-id="ticket.id" />
            </CardContent>
          </Card>
          <div v-if="ticket.actions && ticket.actions.length > 0">
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
                  {{ $t(`action.${row.actionType}`) }}
                </Badge>
              </template>

              <template #cell-user="{ row }">
                <div v-if="row.issuer" class="font-medium">
                  <div>{{ row.issuer.firstName }} {{ row.issuer.lastName }}</div>
                </div>
                <div v-else>—</div>
              </template>
              <template #cell-targetUser="{ row }">
                <div v-if="row.target" class="text-sm">
                  <div>{{ row.target.firstName }} {{ row.target.lastName }}</div>
                </div>
                <div v-else>—</div>
              </template>

              <template #cell-note="{ row }">
                <div v-if="row.note" class="text-sm text-muted-foreground">
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
                <div v-else>—</div>
              </template>

              <template #cell-createdAt="{ row }">
                <span class="text-sm text-muted-foreground">
                  {{ formatGermanDate(row.createdAt) }}
                </span>
              </template>
            </PageTable>
          </div>
          <div v-else class="text-center py-4 text-muted-foreground">
            {{ $t("common.no_action_history") }}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="xl:col-span-3 space-y-6">
          <!-- Ticket Information -->
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
              <AppListItem :title="$t('type.singular')" :value="ticket.type" />
              <AppListItem
                :title="$t('common.created_at')"
                :value="formatGermanDate(ticket.createdAt)"
              />
              <AppListItem
                :title="$t('common.updated_at')"
                :value="formatGermanDate(ticket.updatedAt)"
              />
            </CardContent>
          </Card>

          <!-- Contact Information -->
          <Card>
            <CardHeader>
              <CardTitle>
                <Icon name="solar:user-outline" class="!size-5 opacity-75 shrink-0" />
                {{ $t("form.contact_information") }}
              </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col divide-y divide-dashed">
              <AppListItem :title="$t('global.name')" :value="ticket.requester.name" />
              <AppListItem :title="$t('form.email')" :value="ticket.requester.email" />
              <AppListItem :title="$t('form.phone')" :value="ticket.requester.phone" />
              <AppListItem :title="$t('form.cell')" :value="ticket.requester.cell" />
              <AppListItem :title="$t('form.device_id')" :value="ticket.deviceId" />
            </CardContent>
          </Card>

          <!-- Assignment Information -->
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

              <AppListItem :title="$t('group.singular')" :value="ticket.group?.name" />

              <AppListItem
                :title="$t('admin.singular')"
                :value="
                  ticket.admin ? `${ticket.admin.firstName} ${ticket.admin.lastName}` : ''
                "
              />
            </CardContent>
          </Card>
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

    <!-- Transfer Dialog -->
    <Dialog v-model:open="isTransferDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t("action.transfer") }}</DialogTitle>
          <DialogDescription>
            {{ $t("action.transfer_description", { model: $t("ticket.singular") }) }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="transfer-user">{{ $t("user.singular") }}</Label>
            <Input
              id="transfer-user"
              v-model.number="transferUserId"
              type="number"
              :placeholder="$t('user.singular')"
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isTransferDialogOpen = false">
            {{ $t("action.cancel") }}
          </Button>
          <Button :disabled="!transferUserId || isActionLoading" @click="submitTransfer">
            <Icon
              v-if="isActionLoading"
              name="solar:refresh-linear"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ $t("action.transfer") }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Action Dialog -->
    <Dialog v-model:open="isActionDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t("action.add") + " " + $t("action.singular") }}</DialogTitle>
          <DialogDescription>
            {{
              $t("action.add_description", { action: $t(`action.${selectedActionType}`) })
            }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="action-note">{{ $t("note.singular") }}</Label>
            <Textarea
              id="action-note"
              v-model="actionNote"
              :placeholder="$t('note.placeholder')"
              rows="3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isActionDialogOpen = false">
            {{ $t("action.cancel") }}
          </Button>
          <Button :disabled="isActionLoading" @click="submitAction">
            <Icon
              v-if="isActionLoading"
              name="solar:refresh-linear"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ $t("action.add") + " " + $t("action.singular") }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner";

// Fetch ticket data
import type {
  SupportTicket,
  TicketAction,
  TicketStatus,
  TicketAttachment,
} from "~/types";

const props = defineProps<{
  id: string;
}>();

const { t } = useI18n();
const { addOpenedTicket, removeOpenedTicket } = useOpenedTickets();
const route = useRoute();
const router = useRouter();

// Page configuration
const pageTitle = computed(() =>
  t("action.message.title", { model: t("ticket.singular") })
);
const pageIcon = usePageIcon();
const pageDescription = computed(() =>
  t("action.message.description", { model: t("ticket.singular") })
);
const formatGermanDate = (iso: string) => new Date(iso).toLocaleDateString("de-DE");

// Fetch ticket data
const { data: ticketData, pending: isLoading, error, refresh } = useApiFetch<{
  status: boolean;
  message: string;
  data: SupportTicket;
}>(`/api/v1/dashboard/support/tickets/${props.id}`);

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
  crudPath: "tickets",
  tenant: "support",
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
  } catch (error) {
    console.error("Error updating ticket:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleEditDialogClose = () => {
  isEditDialogOpen.value = false;
  resetForm();
};

// Helper function to get latest status
const getLatestStatus = (statuses: TicketStatus[]) => {
  if (!statuses || statuses.length === 0) return null;
  return statuses.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "RESOLVED":
      return "success";
    case "CLOSED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

// API Functions
const isActionLoading = ref(false);

// Self assign function
const assignSelf = async () => {
  if (!ticket.value) return;

  isActionLoading.value = true;
  try {
    await useApiFetch(
      `/api/v1/dashboard/support/tickets/${ticket.value.id}/self-assign`,
      {
        method: "POST",
      }
    );

    await refresh();
    toast.success(
      t("action.message.assigned_successfully", { model: t("ticket.singular") })
    );
    // Refresh the page data
    await navigateTo(route.fullPath, { replace: true });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    toast.error("Failed to assign ticket");
  } finally {
    isActionLoading.value = false;
  }
};

// Transfer function
const transferTicket = async (userId: number) => {
  if (!ticket.value) return;

  isActionLoading.value = true;
  try {
    await useApiFetch(`/api/v1/dashboard/support/tickets/${ticket.value.id}/transfer`, {
      method: "POST",
      body: { user_id: userId },
    });

    toast.success(
      t("action.message.transferred_successfully", { model: t("ticket.singular") })
    );
    // Refresh the page data
    await navigateTo(route.fullPath, { replace: true });
  } catch (error) {
    console.error("Error transferring ticket:", error);
    toast.error("Failed to transfer ticket");
  } finally {
    isActionLoading.value = false;
  }
};

// Add action function
const addTicketAction = async (actionType: string, note?: string) => {
  if (!ticket.value) return;

  isActionLoading.value = true;
  try {
    await useApiFetch(`/api/v1/dashboard/support/tickets/${ticket.value.id}/action`, {
      method: "POST",
      body: {
        action_type: actionType,
        note: note || "",
      },
    });

    toast.success(t(`action.message.${actionType}_added`));
    // Refresh the page data
    await navigateTo(route.fullPath, { replace: true });
  } catch (error) {
    console.error("Error adding action:", error);
    toast.error("Failed to add action");
  } finally {
    isActionLoading.value = false;
  }
};

// Dialog states for actions
const isTransferDialogOpen = ref(false);
const isActionDialogOpen = ref(false);
const selectedActionType = ref("");
const actionNote = ref("");
const transferUserId = ref<number | undefined>(undefined);

// Available action types
const actionTypes = [
  "assign",
  "reassign",
  "unassign",
  "temporary_assign",
  "upgrade_hardware",
  "downgrade_hardware",
  "upgrade_software",
  "downgrade_software",
  "repair_hardware",
  "repair_software",
  "clean",
  "reconfigure",
  "change_network",
  "add_peripherals",
  "remove_peripherals",
  "install_software",
  "uninstall_software",
  "update_license",
  "decommission",
  "reactivate",
  "mark_off_duty",
  "return_to_inventory",
  "troubleshoot",
  "reset_password",
  "replace",
  "audit",
  "backup",
  "restore",
  "loan",
  "retrieve",
  "tag",
  "create",
  "status_change",
  "transfer",
];

// Handle action selection
const handleActionSelect = (actionType: string) => {
  selectedActionType.value = actionType;
  actionNote.value = "";
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

// Action history table configuration
const actionHistoryHeaders = computed(() => [
  {
    as: "th" as const,
    name: t("action.type"),
    id: "actionType",
  },
  {
    as: "th" as const,
    name: t("action.by"),
    id: "user",
  },
  {
    as: "th" as const,
    name: t("action.assigned_to"),
    id: "targetUser",
  },
  {
    as: "th" as const,
    name: t("note.singular"),
    id: "note",
  },
  {
    as: "th" as const,
    name: t("common.created_at"),
    id: "createdAt",
  },
]);

const sortedActionsHistory = computed(() => {
  if (!ticket.value?.actions) return [];
  return [...ticket.value.actions].sort(
    (a: TicketAction, b: TicketAction) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});
</script>

<script setup lang="ts">
import type { SupportTicket } from "~/types";

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
  SupportTicket,
  TicketForm
>({
  crudPath: "tickets",
  tenant: "support",
  formSchema: createTicketSchema(t),
});

// Requester fields
const [requesterName, requesterNameAttrs] = defineField("requester.name");
const [requesterEmail, requesterEmailAttrs] = defineField("requester.email");
const [requesterPhone, requesterPhoneAttrs] = defineField("requester.phone");
const [requesterCell, requesterCellAttrs] = defineField("requester.cell");

// Ticket fields
const [groupId, groupIdAttrs] = defineField("groupId");
const [ticketCategoryId, ticketCategoryIdAttrs] = defineField("ticketCategoryId");
const [message, messageAttrs] = defineField("message");
const [type, typeAttrs] = defineField("type");
const [adminId, adminIdAttrs] = defineField("adminId");
const [deviceId, deviceIdAttrs] = defineField("deviceId");

const props = withDefaults(
  defineProps<{
    dialogMode?: "add" | "edit" | null;
    editingTicket?: SupportTicket | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
  }>(),
  {
    dialogMode: null,
    editingTicket: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
  }
);

const emit = defineEmits<{
  (event: "update:dialogMode", value: "add" | "edit"): void;
  (event: "update:editingTicket", value: SupportTicket | null): void;
  (event: "update:isDialogOpen", value: boolean): void;
  (event: "submitAndClose" | "submitAndAddNew", values: TicketForm): void;
  (event: "closeDialog"): void;
}>();

const dialogTitle = computed(() => {
  return props.dialogMode === "add" ? t("action.add") : t("action.edit");
});

const dialogDescription = computed(() => {
  return props.dialogMode === "add"
    ? t("action.message.add_description", { model: t("ticket.singular") })
    : t("action.message.edit_description", { model: t("ticket.singular") });
});

const isOpen = computed({
  get: () => props.isDialogOpen,
  set: (value: boolean) => emit("update:isDialogOpen", value),
});

// Watch for changes to editingTicket and populate form
watch(
  () => props.editingTicket,
  (ticket) => {
    if (ticket && props.dialogMode === "edit") {
      nextTick(() => {
        setValues({
          requester: {
            name: ticket.requester.name,
            email: ticket.requester.email,
            phone: ticket.requester.phone,
            cell: ticket.requester.cell,
          },
          groupId: ticket.groupId,
          ticketCategoryId: ticket.ticketCategoryId,
          message: ticket.message,
          type: ticket.type,
          adminId: ticket.adminId,
          deviceId: ticket.deviceId,
        });
      });
    }
  },
  { immediate: true }
);

// Watch for dialog mode changes to reset form when switching to add mode
watch(
  () => props.dialogMode,
  (newMode, oldMode) => {
    if (newMode === "add" && (oldMode === "edit" || oldMode === "add")) {
      nextTick(() => {
        resetForm({
          values: {
            requester: {
              name: "",
              email: "",
              phone: "",
              cell: null,
            },
            groupId: "",
            ticketCategoryId: "",
            message: "",
            type: "TICKET",
            adminId: "",
            deviceId: "",
          },
        });
      });
    }
  }
);

// Clear form when dialog closes
watch(
  () => isOpen.value,
  (isOpen) => {
    if (!isOpen) {
      nextTick(() => {
        resetForm({
          values: {
            requester: {
              name: "",
              email: "",
              phone: "",
              cell: null,
            },
            groupId: "",
            ticketCategoryId: "",
            message: "",
            type: "TICKET",
            adminId: "",
            deviceId: "",
          },
        });
      });
    }
  }
);

// Handle form submission with validation
const submitForm = (action: "submitAndClose" | "submitAndAddNew") => {
  handleSubmit((values) => {
    emit(action, values as TicketForm);
  })();
};

// Mock data for dropdowns - in real app, these would come from API
const groupOptions = ref([
  { value: "group-1", label: "IT Support" },
  { value: "group-2", label: "HR Support" },
  { value: "group-3", label: "Finance Support" },
]);

const categoryOptions = ref([
  { value: "cat-1", label: "Technical Issues" },
  { value: "cat-2", label: "Account Issues" },
  { value: "cat-3", label: "General Inquiry" },
]);

const adminOptions = ref([
  { value: "admin-1", label: "Jane Smith" },
  { value: "admin-2", label: "John Doe" },
  { value: "admin-3", label: "Alice Johnson" },
]);

const typeOptions = ref([
  { value: "TICKET", label: t("ticket.type.ticket") },
  { value: "TASK", label: t("ticket.type.task") },
]);
</script>

<template>
  <FormDialog v-model:open="isOpen" :title="dialogTitle" :description="dialogDescription">
    <template #content>
      <form @submit.prevent="submitForm('submitAndClose')">
        <div class="space-y-6">
          <!-- Requester Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">{{ $t("requester.information") }}</h3>
            <div class="grid grid-cols-12 gap-4">
              <FormItemInput
                id="requesterName"
                v-model="requesterName"
                :title="$t('requester.name')"
                :placeholder="$t('requester.name')"
                class="col-span-6"
                :errors="errors.requester?.name ? [errors.requester.name] : []"
                v-bind="requesterNameAttrs"
                required
              />
              <FormItemInput
                id="requesterEmail"
                v-model="requesterEmail"
                :title="$t('requester.email')"
                :placeholder="$t('requester.email')"
                type="email"
                class="col-span-6"
                :errors="errors.requester?.email ? [errors.requester.email] : []"
                v-bind="requesterEmailAttrs"
                required
              />
              <FormItemInput
                id="requesterPhone"
                v-model="requesterPhone"
                :title="$t('requester.phone')"
                :placeholder="$t('requester.phone')"
                class="col-span-6"
                :errors="errors.requester?.phone ? [errors.requester.phone] : []"
                v-bind="requesterPhoneAttrs"
                required
              />
              <FormItemInput
                id="requesterCell"
                v-model="requesterCell"
                :title="$t('requester.cell')"
                :placeholder="$t('requester.cell')"
                class="col-span-6"
                :errors="errors.requester?.cell ? [errors.requester.cell] : []"
                v-bind="requesterCellAttrs"
              />
            </div>
          </div>

          <!-- Ticket Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">{{ $t("ticket.information") }}</h3>
            <div class="grid grid-cols-12 gap-4">
              <FormItemSelect
                id="groupId"
                v-model="groupId"
                :title="$t('group.singular')"
                :placeholder="$t('group.select')"
                class="col-span-6"
                :errors="errors.groupId ? [errors.groupId] : []"
                v-bind="groupIdAttrs"
                :options="groupOptions"
                required
              />
              <FormItemSelect
                id="ticketCategoryId"
                v-model="ticketCategoryId"
                :title="$t('category.singular')"
                :placeholder="$t('category.select')"
                class="col-span-6"
                :errors="errors.ticketCategoryId ? [errors.ticketCategoryId] : []"
                v-bind="ticketCategoryIdAttrs"
                :options="categoryOptions"
                required
              />
              <FormItemSelect
                id="type"
                v-model="type"
                :title="$t('type.singular')"
                :placeholder="$t('type.select')"
                class="col-span-6"
                :errors="errors.type ? [errors.type] : []"
                v-bind="typeAttrs"
                :options="typeOptions"
                required
              />
              <FormItemSelect
                id="adminId"
                v-model="adminId"
                :title="$t('admin.singular')"
                :placeholder="$t('admin.select')"
                class="col-span-6"
                :errors="errors.adminId ? [errors.adminId] : []"
                v-bind="adminIdAttrs"
                :options="adminOptions"
                required
              />
              <FormItemTextarea
                id="message"
                v-model="message"
                :title="$t('message.singular')"
                :placeholder="$t('message.placeholder')"
                class="col-span-12"
                :errors="errors.message ? [errors.message] : []"
                v-bind="messageAttrs"
                :rows="4"
                required
              />
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <Button variant="outline" :disabled="isSubmitting" @click="emit('closeDialog')">
        {{ $t("action.cancel") }}
      </Button>
      <Button
        variant="outline"
        :disabled="isSubmitting"
        @click="submitForm('submitAndAddNew')"
      >
        <Icon
          v-if="isSubmitting"
          name="solar:refresh-linear"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{
          dialogMode === "add"
            ? $t("action.create") +
              " " +
              $t("common.and") +
              " " +
              $t("action.add") +
              " " +
              $t("common.new")
            : $t("action.update") +
              " " +
              $t("common.and") +
              " " +
              $t("action.add") +
              " " +
              $t("common.new")
        }}
      </Button>
      <Button :disabled="isSubmitting" @click="submitForm('submitAndClose')">
        <Icon
          v-if="isSubmitting"
          name="solar:refresh-linear"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{ dialogMode === "add" ? $t("action.create") : $t("action.update") }}
      </Button>
    </template>
  </FormDialog>
</template>

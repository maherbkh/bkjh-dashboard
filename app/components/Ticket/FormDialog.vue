<script setup lang="ts">
import type { Admin, SupportTicket } from '~/types';
import { storeToRefs } from 'pinia';
import { useResourcesStore } from '~/stores/resources';

function adminDisplayName(admin: Admin): string {
    const combined = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim();
    return admin.name?.trim() || combined || admin.email;
}

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
    SupportTicket,
    TicketForm
>({
    crudPath: 'tickets',
    tenant: 'support',
    formSchema: createTicketSchema(t),
});

// Requester fields
const [requesterName, requesterNameAttrs] = defineField('requester.name');
const [requesterEmail, requesterEmailAttrs] = defineField('requester.email');
const [requesterPhone, requesterPhoneAttrs] = defineField('requester.phone');
const [requesterCell, requesterCellAttrs] = defineField('requester.cell');

// Ticket fields
const [groupId, groupIdAttrs] = defineField('groupId');
const [ticketCategoryId, ticketCategoryIdAttrs] = defineField('ticketCategoryId');
const [message, messageAttrs] = defineField('message');
const [type, typeAttrs] = defineField('type');
const [adminId, adminIdAttrs] = defineField('adminId');
const [deviceId, deviceIdAttrs] = defineField('deviceId');

const props = withDefaults(
    defineProps<{
        dialogMode?: 'add' | 'edit' | null;
        editingTicket?: SupportTicket | null;
        isSubmitting?: boolean;
        isDialogOpen?: boolean;
    }>(),
    {
        dialogMode: null,
        editingTicket: null,
        isSubmitting: () => false,
        isDialogOpen: () => false,
    },
);

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingTicket', value: SupportTicket | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: TicketForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add' ? t('action.add') : t('action.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.message.add_description', { model: t('ticket.singular') })
        : t('action.message.edit_description', { model: t('ticket.singular') });
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

const resourcesStore = useResourcesStore();
const { groups, ticketCategories } = storeToRefs(resourcesStore);

/** FormItemSelect uses `data` + id/name keys, not `options` with value/label. */
const groupSelectData = computed(() => groups.value.filter(g => g.isActive !== false));

const ticketCategorySelectData = computed(() =>
    ticketCategories.value.filter(c => c.isActive !== false),
);

// Same source as ticket transfer dialog (`/shared/select-lists/admins`).
// `showSelf: true` so the current user can be selected as assignee (transfer excludes self).
const {
    admins: adminsForTicketForm,
    loadingAdmins,
    refreshAdmins,
} = useAdminsList({
    showSelf: true,
    immediate: false,
});

const adminSelectData = computed(() =>
    adminsForTicketForm.value
        .filter(a => a.isActive !== false)
        .map(a => ({ id: a.id, name: adminDisplayName(a) })),
);

watch(
    () => isOpen.value,
    (open) => {
        if (!open || !import.meta.client) {
            return;
        }
        const needGroups = resourcesStore.groups.length === 0;
        const needCategories = resourcesStore.ticketCategories.length === 0;
        if (needGroups || needCategories) {
            void resourcesStore.fetchAdminData(true);
        }
        if (adminsForTicketForm.value.length === 0) {
            void refreshAdmins();
        }
    },
);

// Watch for changes to editingTicket and populate form
watch(
    () => props.editingTicket,
    (ticket) => {
        if (ticket && props.dialogMode === 'edit') {
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
    { immediate: true },
);

// Watch for dialog mode changes to reset form when switching to add mode
watch(
    () => props.dialogMode,
    (newMode, oldMode) => {
        if (newMode === 'add' && (oldMode === 'edit' || oldMode === 'add')) {
            nextTick(() => {
                resetForm({
                    values: {
                        requester: {
                            name: '',
                            email: '',
                            phone: '',
                            cell: null,
                        },
                        groupId: '',
                        ticketCategoryId: '',
                        message: '',
                        type: 'TICKET',
                        adminId: '',
                        deviceId: '',
                    },
                });
            });
        }
    },
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
                            name: '',
                            email: '',
                            phone: '',
                            cell: null,
                        },
                        groupId: '',
                        ticketCategoryId: '',
                        message: '',
                        type: 'TICKET',
                        adminId: '',
                        deviceId: '',
                    },
                });
            });
        }
    },
);

// Handle form submission with validation
const submitForm = (action: 'submitAndClose' | 'submitAndAddNew') => {
    handleSubmit((values) => {
        emit(action, values as TicketForm);
    })();
};

const typeSelectData = computed(() => [
    { id: 'TICKET', name: t('ticket.type.ticket') },
    { id: 'TASK', name: t('ticket.type.task') },
]);
</script>

<template>
    <FormDialog
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="dialogDescription"
    >
        <template #content>
            <form @submit.prevent="submitForm('submitAndClose')">
                <div class="space-y-6">
                    <!-- Requester Information -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-medium">
                            {{ $t("requester.information") }}
                        </h3>
                        <div class="grid grid-cols-12 gap-4 items-start p-5 bg-muted border-2 border-dashed rounded-md">
                            <FormItemInput
                                id="requesterName"
                                v-model="requesterName"
                                :title="$t('requester.name')"
                                :placeholder="$t('requester.name')"
                                class="col-span-6"
                                :errors="(errors as Record<string, string | undefined>)['requester.name'] ? [(errors as Record<string, string | undefined>)['requester.name']!] : []"
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
                                :errors="(errors as Record<string, string | undefined>)['requester.email'] ? [(errors as Record<string, string | undefined>)['requester.email']!] : []"
                                v-bind="requesterEmailAttrs"
                                required
                            />
                            <FormItemInput
                                id="requesterPhone"
                                v-model="requesterPhone"
                                :title="$t('requester.phone')"
                                :placeholder="$t('requester.phone')"
                                class="col-span-6"
                                :errors="(errors as Record<string, string | undefined>)['requester.phone'] ? [(errors as Record<string, string | undefined>)['requester.phone']!] : []"
                                v-bind="requesterPhoneAttrs"
                                required
                            />
                            <FormItemInput
                                id="requesterCell"
                                v-model="requesterCell"
                                :title="$t('requester.cell')"
                                :placeholder="$t('requester.cell')"
                                class="col-span-6"
                                :errors="(errors as Record<string, string | undefined>)['requester.cell'] ? [(errors as Record<string, string | undefined>)['requester.cell']!] : []"
                                v-bind="requesterCellAttrs"
                            />
                        </div>
                    </div>

                    <!-- Ticket Information -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-medium">
                            {{ $t("ticket.information") }}
                        </h3>
                        <div class="grid grid-cols-12 gap-4 items-start  p-5 bg-muted border-2 border-dashed rounded-md">
                            <FormItemSelect
                                id="groupId"
                                v-model="groupId"
                                :title="$t('group.singular')"
                                :placeholder="$t('group.select')"
                                class="col-span-6"
                                :errors="errors.groupId ? [errors.groupId] : []"
                                v-bind="groupIdAttrs"
                                :data="groupSelectData"
                            />
                            <FormItemSelect
                                id="ticketCategoryId"
                                v-model="ticketCategoryId"
                                :title="$t('category.singular')"
                                :placeholder="$t('category.select')"
                                class="col-span-6"
                                :errors="errors.ticketCategoryId ? [errors.ticketCategoryId] : []"
                                v-bind="ticketCategoryIdAttrs"
                                :data="ticketCategorySelectData"
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
                                :data="typeSelectData"
                                required
                            />
                            <div class="col-span-6 grid gap-2">
                                <FormItemSelect
                                    id="adminId"
                                    v-model="adminId"
                                    :title="$t('admin.singular')"
                                    :placeholder="$t('admin.select')"
                                    class="w-full"
                                    :errors="errors.adminId ? [errors.adminId] : []"
                                    v-bind="adminIdAttrs"
                                    :data="adminSelectData"
                                    :empty-text="$t('admin.no_admins_available')"
                                    :disabled="loadingAdmins"
                                />
                                <p
                                    v-if="loadingAdmins"
                                    class="text-xs text-muted-foreground flex items-center gap-1"
                                >
                                    <Icon
                                        name="solar:refresh-linear"
                                        class="size-3! animate-spin"
                                    />
                                    {{ $t('admin.loading') }}
                                </p>
                            </div>
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
            <Button
                variant="outline"
                :disabled="isSubmitting"
                @click="emit('closeDialog')"
            >
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
                        ? $t("action.create")
                            + " "
                            + $t("common.and")
                            + " "
                            + $t("action.add")
                            + " "
                            + $t("common.new")
                        : $t("action.update")
                            + " "
                            + $t("common.and")
                            + " "
                            + $t("action.add")
                            + " "
                            + $t("common.new")
                }}
            </Button>
            <Button
                :disabled="isSubmitting"
                @click="submitForm('submitAndClose')"
            >
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

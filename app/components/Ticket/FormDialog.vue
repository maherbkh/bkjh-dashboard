<script setup lang="ts">
import type { Ticket } from '~/types';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Ticket, TicketCrudForm>({
    apiSlug: 'tickets',
    formSchema: createTicketCrudSchema(t),
});

// Load list data for dropdowns
const { groups } = useGroupsList();
const { categories } = useCategoriesList();

const [name, nameAttrs] = defineField('name');
const [message, messageAttrs] = defineField('message');
const [email, emailAttrs] = defineField('email');
const [phone, phoneAttrs] = defineField('phone');
const [cell, cellAttrs] = defineField('cell');
const [deviceId, deviceIdAttrs] = defineField('deviceId');
const [groupId, groupIdAttrs] = defineField('groupId');
const [categoryId, categoryIdAttrs] = defineField('categoryId');
const [status, statusAttrs] = defineField('status');

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingTicket?: Ticket | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingTicket: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingTicket', value: Ticket | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: TicketCrudForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add')
        : t('action.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('common.add') + ' ' + t('ticket.singular')
        : t('common.edit') + ' ' + t('ticket.singular');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Status options
const statusOptions = computed(() => [
    { value: 'pending', label: t('common.pending') },
    { value: 'in_progress', label: t('common.in_progress') },
    { value: 'resolved', label: t('common.resolved') },
    { value: 'closed', label: t('common.closed') },
]);

// Group options
const groupOptions = computed(() => [
    { value: null, label: t('form.select_option') },
    ...groups.value.map(group => ({
        value: group.id,
        label: group.name,
    })),
]);

// Category options
const categoryOptions = computed(() => [
    { value: null, label: t('forms.select_option') },
    ...categories.value.map(category => ({
        value: category.id,
        label: category.name,
    })),
]);

// Watch for changes to editingTicket and populate form
watch(() => props.editingTicket, (ticket) => {
    if (ticket && props.dialogMode === 'edit') {
        // Add a small delay to prevent focus issues
        nextTick(() => {
            setValues({
                name: ticket.name,
                message: ticket.message,
                email: ticket.email || '',
                phone: ticket.phone || '',
                cell: ticket.cell || '',
                deviceId: ticket.deviceId || '',
                groupId: ticket.group?.id || null,
                categoryId: ticket.category?.id || null,
                status: ticket.status,
            });
        });
    }
}, { immediate: true });

// Watch for dialog mode changes to reset form when switching to add mode
watch(() => props.dialogMode, (newMode, oldMode) => {
    if (newMode === 'add' && (oldMode === 'edit' || oldMode === 'add')) {
        // Reset form when switching to add mode (submitAndAddNew scenario)
        nextTick(() => {
            resetForm({
                values: {
                    name: '',
                    message: '',
                    email: '',
                    phone: '',
                    cell: '',
                    deviceId: '',
                    groupId: null,
                    categoryId: null,
                    status: 'pending',
                },
            });
        });
    }
});

// Clear form when dialog closes
watch(() => isOpen.value, (isOpen) => {
    if (!isOpen) {
        // Clear form when dialog closes to prevent focus issues
        nextTick(() => {
            resetForm({
                values: {
                    name: '',
                    message: '',
                    email: '',
                    phone: '',
                    cell: '',
                    deviceId: '',
                    groupId: null,
                    categoryId: null,
                    status: 'pending',
                },
            });
        });
    }
});

// Handle form submission with validation
const submitForm = (action: 'submitAndClose' | 'submitAndAddNew') => {
    handleSubmit((values) => {
        // Only emit if validation passes
        emit(action, values as TicketCrudForm);
    })();
};
</script>

<template>
    <FormDialog
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="dialogDescription"
        class="max-w-4xl"
    >
        <template #content>
            <form @submit.prevent="submitForm('submitAndClose')">
                <div class="grid grid-cols-12 gap-4">
                    <!-- Name -->
                    <FormItemInput
                        id="name"
                        v-model="name"  
                        :title="$t('global.name')"
                        :placeholder="$t('global.name')"
                        class="col-span-6"
                        :errors="errors.name ? [errors.name] : []"
                        v-bind="nameAttrs"
                        required
                    />

                    <!-- Status -->
                    <FormItemSelect
                        id="status"
                        v-model="status"
                        :title="$t('common.status')"
                        :placeholder="$t('common.status')"
                        class="col-span-6"
                        :options="statusOptions"
                        :errors="errors.status ? [errors.status] : []"
                        v-bind="statusAttrs"
                        required
                    />

                    <!-- Message -->
                    <FormItemTextarea
                        id="message"
                        v-model="message"
                        :title="$t('global.message')"
                        :placeholder="$t('global.message')"
                        class="col-span-12"
                        :errors="errors.message ? [errors.message] : []"
                        v-bind="messageAttrs"
                        :rows="4"
                        required
                    />

                    <!-- Contact Information -->
                    <div class="col-span-12">
                        <h4 class="text-sm font-medium mb-3">
                            {{ $t('form.contact_information') }}
                        </h4>
                    </div>

                    <!-- Email -->
                    <FormItemInput
                        id="email"
                        v-model="email"
                        :title="$t('form.email')"
                        :placeholder="$t('form.email_placeholder')"
                        class="col-span-6"
                        type="email"
                        :errors="errors.email ? [errors.email] : []"
                        v-bind="emailAttrs"
                    />

                    <!-- Phone -->
                    <FormItemInput
                        id="phone"
                        v-model="phone"
                        :title="$t('form.phone')"
                        :placeholder="$t('form.phone_placeholder')"
                        class="col-span-6"
                        type="tel"
                        :errors="errors.phone ? [errors.phone] : []"
                        v-bind="phoneAttrs"
                    />

                    <!-- Cell -->
                    <FormItemInput
                        id="cell"
                        v-model="cell"
                        :title="$t('form.cell')"
                        :placeholder="$t('form.cell_placeholder')"
                        class="col-span-6"
                        type="tel"
                        :errors="errors.cell ? [errors.cell] : []"
                        v-bind="cellAttrs"
                    />

                    <!-- Device ID -->
                    <FormItemInput
                        id="deviceId"
                        v-model="deviceId"
                        :title="$t('form.device_id')"
                        :placeholder="$t('form.device_id_placeholder')"
                        class="col-span-6"
                        :errors="errors.deviceId ? [errors.deviceId] : []"
                        v-bind="deviceIdAttrs"
                    />

                    <!-- Assignment Information -->
                    <div class="col-span-12">
                        <h4 class="text-sm font-medium mb-3">
                            {{ $t('form.assignment_information') }}
                        </h4>
                    </div>

                    <!-- Group -->
                    <FormItemSelect
                        id="groupId"
                        v-model="groupId"
                        :title="$t('group.singular')"
                        :placeholder="$t('group.singular')"
                        class="col-span-6"
                        :options="groupOptions"
                        :errors="errors.groupId ? [errors.groupId] : []"
                        v-bind="groupIdAttrs"
                    />

                    <!-- Category -->
                    <FormItemSelect
                        id="categoryId"
                        v-model="categoryId"
                        :title="$t('category.singular')"
                        :placeholder="$t('category.singular')"
                        class="col-span-6"
                        :options="categoryOptions"
                        :errors="errors.categoryId ? [errors.categoryId] : []"
                        v-bind="categoryIdAttrs"
                    />
                </div>
            </form>
        </template>

        <template #footer>
            <Button
                variant="outline"
                :disabled="isSubmitting"
                @click="emit('closeDialog')"
            >
                {{ $t('action.cancel') }}
            </Button>
            <Button
                v-if="dialogMode === 'add'"
                variant="outline"
                :disabled="isSubmitting"
                @click="submitForm('submitAndAddNew')"
            >
                <Icon
                    v-if="isSubmitting"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                {{ $t('action.create') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
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
                {{ dialogMode === 'add' ? $t('action.create') : $t('action.update') }}
            </Button>
        </template>
    </FormDialog>
</template>

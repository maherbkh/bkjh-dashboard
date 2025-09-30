<script setup lang="ts">
import { z } from 'zod';
import type { Admin, AdminForm, Occupation } from '~/types';
import { createAdminSchema, createAdminCreateSchema, createAdminUpdateSchema, AVAILABLE_APPS } from '~/composables/adminSchema';

const { t } = useI18n();

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingAdmin?: Admin | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
    occupations?: Occupation[];
}>(), {
    dialogMode: null,
    editingAdmin: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
    occupations: () => [],
});

// Schema management with reactive ref
const currentSchema = ref<ReturnType<typeof createAdminCreateSchema> | ReturnType<typeof createAdminUpdateSchema> | undefined>(undefined);

// Watch for dialog mode changes to reload schema
watch([() => props.isDialogOpen, () => props.dialogMode], ([isOpen, dialogMode]) => {
    if (isOpen && dialogMode) {
        if (dialogMode === 'add') {
            currentSchema.value = createAdminCreateSchema(t);
        } else {
            currentSchema.value = createAdminUpdateSchema(t);
        }
    } else {
        currentSchema.value = undefined;
    }
}, { immediate: false });

const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Admin, AdminForm>({
    crudPath: 'admins',
    tenant: 'shared',
    formSchema: currentSchema.value,
});

// Define fields only when schema is available
const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [occupationId, occupationIdAttrs] = defineField('occupationId');
const [isActive, isActiveAttrs] = defineField('isActive');
const [isSuperAdmin, isSuperAdminAttrs] = defineField('isSuperAdmin');
const [apps, appsAttrs] = defineField('apps');

// Occupations from props
const occupations = computed(() => props.occupations || []);

// Available apps options
const availableApps = computed(() => AVAILABLE_APPS.map(app => ({
    id: app.value,
    name: app.label,
})));

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingAdmin', value: Admin | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: AdminForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('admin.singular')
        : t('action.edit') + ' ' + t('admin.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('admin.add_description')
        : t('admin.edit_description');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingAdmin and populate form
watch(() => props.editingAdmin, (admin) => {
    if (admin && props.dialogMode === 'edit') {
        setValues({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            occupationId: admin.occupationId || null,
            isActive: admin.isActive ?? true,
            isSuperAdmin: admin.isSuperAdmin ?? false,
            apps: admin.apps || ['dashboard'],
        });
    }
});

// Watch for dialog mode changes to reset form when switching to add mode
watch(() => props.dialogMode, (newMode, oldMode) => {
    if (newMode === 'add' && (oldMode === 'edit' || oldMode === 'add')) {
        // Reset form when switching to add mode (submitAndAddNew scenario)
        nextTick(() => {
            resetForm({
                values: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    occupationId: null,
                    isActive: true,
                    isSuperAdmin: false,
                    apps: ['dashboard'],
                },
            });
        });
    }
});

// Clear form and reset schema when dialog closes
watch(() => props.isDialogOpen, (isOpen) => {
    if (!isOpen) {
        // Clear form when dialog closes to prevent focus issues
        nextTick(() => {
            resetForm({
                values: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    occupationId: null,
                    isActive: true,
                    isSuperAdmin: false,
                    apps: ['dashboard'],
                },
            });
        });
    }
});

const onSubmitAndClose = handleSubmit((values) => {
    // For update mode, password is already excluded by the schema
    // For create mode, password is included and required
    emit('submitAndClose', values);
});

const onSubmitAndAddNew = handleSubmit((values) => {
    // For update mode, password is already excluded by the schema
    // For create mode, password is included and required
    emit('submitAndAddNew', values);
});

const handleClose = () => {
    emit('closeDialog');
};
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>{{ dialogTitle }}</DialogTitle>
                <DialogDescription>
                    {{ dialogDescription }}
                </DialogDescription>
            </DialogHeader>
            <form class="space-y-4">
                <div class="grid md:grid-cols-12 gap-4 items-start">
                    <FormItemInput
                        id="firstName"
                        v-model="firstName"
                        class="md:col-span-6"
                        v-bind="firstNameAttrs"
                        :title="$t('admin.first_name')"
                        :placeholder="$t('admin.first_name_placeholder')"
                        :errors="errors.firstName ? [errors.firstName] : []"
                        required
                    />
                    <FormItemInput
                        id="lastName"
                        v-model="lastName"
                        class="md:col-span-6"
                        v-bind="lastNameAttrs"
                        :title="$t('admin.last_name')"
                        :placeholder="$t('admin.last_name_placeholder')"
                        :errors="errors.lastName ? [errors.lastName] : []"
                        required
                    />
                    <FormItemInput
                        id="email"
                        v-model="email"
                        class="md:col-span-6"
                        v-bind="emailAttrs"
                        type="email"
                        :title="$t('form.email')"
                        :placeholder="$t('form.email_placeholder')"
                        :errors="errors.email ? [errors.email] : []"
                        required
                    />
                    <FormItemInput
                        v-if="dialogMode === 'add'"
                        id="password"
                        v-model="password"
                        class="md:col-span-6"
                        v-bind="passwordAttrs"
                        type="password"
                        use-show-password
                        :title="$t('form.password')"
                        :placeholder="$t('form.password_placeholder')"
                        :errors="errors.password ? [errors.password] : []"
                        required
                    />
                    <FormItemInput
                        v-if="dialogMode === 'edit'"
                        id="password"
                        v-model="password"
                        class="md:col-span-6"
                        v-bind="passwordAttrs"
                        type="password"
                        use-show-password
                        :title="$t('form.password')"
                        :placeholder="$t('admin.password_change_placeholder')"
                        :errors="errors.password ? [errors.password] : []"
                    />
                    <FormItemSelect
                        id="occupationId"
                        v-model="occupationId"
                        class="md:col-span-6"
                        v-bind="occupationIdAttrs"
                        :title="$t('occupation.singular')"
                        :data="occupations"
                        key-value="id"
                        name-value="name"
                        :placeholder="$t('occupation.singular_placeholder')"
                        :errors="errors.occupationId ? [errors.occupationId] : []"
                    />
                    <FormItemMultiSelect
                        id="apps"
                        v-model="apps"
                        class="md:col-span-6"
                        v-bind="appsAttrs"
                        :title="$t('admin.apps')"
                        :data="availableApps"
                        key-value="id"
                        name-value="name"
                        :placeholder="$t('admin.apps_placeholder')"
                        :errors="errors.apps ? [errors.apps] : []"
                        required
                    />
                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        class="md:col-span-6"
                        v-bind="isActiveAttrs"
                        :title="$t('common.status')"
                        :true-label="$t('common.active')"
                        :false-label="$t('common.inactive')"
                        :errors="errors.isActive ? [errors.isActive] : []"
                    />
                    <FormItemSwitch
                        id="isSuperAdmin"
                        v-model="isSuperAdmin"
                        class="md:col-span-6"
                        v-bind="isSuperAdminAttrs"
                        :title="$t('admin.is_super_admin')"
                        :true-label="$t('admin.super_admin')"
                        :false-label="$t('admin.not_super_admin')"
                        :errors="errors.isSuperAdmin ? [errors.isSuperAdmin] : []"
                    />
                </div>
            </form>
            <DialogFooter class="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    @click="handleClose"
                >
                    {{ $t('action.cancel') }}
                </Button>
                <Button
                    v-if="dialogMode === 'add'"
                    type="button"
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="onSubmitAndAddNew"
                >
                    <Icon
                        v-if="isSubmitting"
                        name="solar:refresh-outline"
                        class="animate-spin mr-2 h-4 w-4"
                    />
                    {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
                </Button>
                <Button
                    type="button"
                    :disabled="isSubmitting"
                    @click="onSubmitAndClose"
                >
                    <Icon
                        v-if="isSubmitting"
                        name="solar:refresh-outline"
                        class="animate-spin mr-2 h-4 w-4"
                    />
                    {{ dialogMode === 'add' ? $t('action.save') : $t('action.update') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

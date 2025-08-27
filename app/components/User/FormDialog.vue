<script setup lang="ts">
import { z } from 'zod';
import type { User } from '~/types';
import type { UserForm } from '~/composables/userSchema';
const { t } = useI18n();

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingUser?: User | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
    roles?: Array<{ id: number; name: string; position: number }>;
}>(), {
    dialogMode: null,
    editingUser: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
    roles: () => [],
});

// Schema management with reactive ref
const currentSchema = ref<ReturnType<typeof createUserSchema> | undefined>(undefined);

// Watch for dialog mode changes to reload schema
watch([() => props.isDialogOpen, () => props.dialogMode], ([isOpen, dialogMode]) => {
    if (isOpen && dialogMode) {
        const mode = dialogMode === 'add' ? 'create' : 'edit';
        currentSchema.value = createUserSchema(t, mode);
    } else {
        currentSchema.value = undefined;
    }
}, { immediate: false });

const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<User, UserForm>({
    apiSlug: 'user',
    formSchema: currentSchema.value,
});

// Define fields only when schema is available
const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [username, usernameAttrs] = defineField('username');
const [role_id, role_idAttrs] = defineField('role_id');
const [isActive, isActiveAttrs] = defineField('isActive');
const [isSuperAdmin, isSuperAdminAttrs] = defineField('isSuperAdmin');

// Password field is only defined in add mode
const [password, passwordAttrs] = defineField('password');

// Roles from props
const roles = computed(() => props.roles || []);

// Debug computed for roles
const rolesDebug = computed(() => ({
    count: roles.value.length,
    roles: roles.value.slice(0, 3), // Show first 3 roles for debugging
}));

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingUser', value: User | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: UserForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new')
        : t('action.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('user.add_description')
        : t('user.edit_description');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingUser and populate form
watch(() => props.editingUser, (user) => {
    if (user && props.dialogMode === 'edit') {
        setValues({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role_id: user.role_id || null, // Set to null if no role_id
            isActive: user.isActive ?? true,
            isSuperAdmin: user.isSuperAdmin ?? false,
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
                    username: '',
                    name: '',
                    password: '',
                    role_id: null,
                    isActive: true,
                    isSuperAdmin: false,
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
                    username: '',
                    name: '',
                    password: '',
                    role_id: null,
                    isActive: true,
                    isSuperAdmin: false,
                },
            });
        });
        // Force schema recomputation by triggering a reactive update
        // This ensures the schema is reset when dialog closes
    }
});

const onSubmitAndClose = handleSubmit((values) => {
    console.log('Form submitted with values:', values);
    console.log('Dialog mode:', props.dialogMode);
    
    // Remove password field if it exists in edit mode
    if (props.dialogMode === 'edit' && 'password' in values) {
        const { password, ...valuesWithoutPassword } = values;
        console.log('Sending values without password:', valuesWithoutPassword);
        emit('submitAndClose', valuesWithoutPassword);
    } else {
        console.log('Sending all values:', values);
        emit('submitAndClose', values);
    }
});

const onSubmitAndAddNew = handleSubmit((values) => {
    emit('submitAndAddNew', values);
});

const handleClose = () => {
    emit('closeDialog');
};
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent
            class="sm:max-w-4xl"
        >
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
                        :title="$t('user.first_name')"
                        :placeholder="$t('user.first_name_placeholder')"
                        :errors="errors.firstName ? [errors.firstName] : []"
                        required
                    />
                    <FormItemInput
                        id="lastName"
                        v-model="lastName"
                        class="md:col-span-6"
                        v-bind="lastNameAttrs"
                        :title="$t('user.last_name')"
                        :placeholder="$t('user.last_name_placeholder')"
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
                        id="username"
                        v-model="username"
                        class="md:col-span-6"
                        v-bind="usernameAttrs"
                        :title="$t('user.username')"
                        :placeholder="$t('user.username_placeholder')"
                        :errors="errors.username ? [errors.username] : []"
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
                    <FormItemSelect
                        id="role_id"
                        v-model="role_id"
                        class="md:col-span-6"
                        v-bind="role_idAttrs"
                        :title="$t('role.singular')"
                        :data="roles"
                        key-value="id"
                        name-value="name"
                        :placeholder="$t('role.singular_placeholder')"
                        :errors="errors.role_id ? [errors.role_id] : []"
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
                        :title="$t('user.is_super_admin')"
                        :true-label="$t('user.super_admin')"
                        :false-label="$t('user.not_super_admin')"
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

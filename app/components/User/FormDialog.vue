<script setup lang="ts">
import type { User } from '../../types';
import type { UserForm } from '../../composables/userSchema';

const { t } = useI18n();

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingUser?: User | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingUser: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

// Use appropriate schema based on dialog mode
const schemaMode = computed(() => props.dialogMode === 'add' ? 'create' : 'edit');
const formSchema = computed(() => createUserSchema(t, schemaMode.value));

const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<User, UserForm>({
    apiSlug: 'user',
    formSchema: formSchema.value,
});

const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [username, usernameAttrs] = defineField('username');
const [password, passwordAttrs] = defineField('password');
const [role_id, role_idAttrs] = defineField('role_id');
const [isActive, isActiveAttrs] = defineField('isActive');
const [isSuperAdmin, isSuperAdminAttrs] = defineField('isSuperAdmin');

// Resources store for roles
const resourcesStore = useResourcesStore();

// Initialize store on mount and when dialog opens
onMounted(async () => {
    await resourcesStore.initialize();
});

// Watch for dialog opening to ensure roles are loaded
watch(() => props.isDialogOpen, async (isOpen) => {
    if (isOpen) {
        // Ensure roles are loaded when dialog opens
        try {
            console.log('Fetching roles...');
            await resourcesStore.fetchRoles();
            console.log('Roles fetched:', resourcesStore.roles.length);
        }
        catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    }
});

// Debug computed for roles
const rolesDebug = computed(() => ({
    count: resourcesStore.roles.length,
    loading: resourcesStore.isLoading,
    error: resourcesStore.error,
    roles: resourcesStore.roles.slice(0, 3), // Show first 3 roles for debugging
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
        ? t('users.add_new')
        : t('users.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('users.add_description')
        : t('users.edit_description');
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
            password: '', // Don't populate password in edit mode
            role_id: user.role_id || 0,
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
                    role_id: 0,
                    isActive: true,
                    isSuperAdmin: false,
                },
            });
        });
    }
});

// Clear form when dialog closes
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
                    role_id: 0,
                    isActive: true,
                    isSuperAdmin: false,
                },
            });
        });
    }
});

const onSubmitAndClose = handleSubmit((values) => {
    // Remove password if it's empty in edit mode
    if (props.dialogMode === 'edit' && !values.password) {
        const { password, ...valuesWithoutPassword } = values;
        emit('submitAndClose', valuesWithoutPassword);
    }
    else {
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
            class="sm:max-w-[600px]"
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
                        :title="$t('users.form.first_name')"
                        :placeholder="$t('users.form.first_name_placeholder')"
                        :errors="errors.firstName ? [errors.firstName] : []"
                        required
                    />
                    <FormItemInput
                        id="lastName"
                        v-model="lastName"
                        class="md:col-span-6"
                        v-bind="lastNameAttrs"
                        :title="$t('users.form.last_name')"
                        :placeholder="$t('users.form.last_name_placeholder')"
                        :errors="errors.lastName ? [errors.lastName] : []"
                        required
                    />
                    <FormItemInput
                        id="email"
                        v-model="email"
                        class="md:col-span-6"
                        v-bind="emailAttrs"
                        type="email"
                        :title="$t('users.form.email')"
                        :placeholder="$t('users.form.email_placeholder')"
                        :errors="errors.email ? [errors.email] : []"
                        required
                    />
                    <FormItemInput
                        id="username"
                        v-model="username"
                        class="md:col-span-6"
                        v-bind="usernameAttrs"
                        :title="$t('users.form.username')"
                        :placeholder="$t('users.form.username_placeholder')"
                        :errors="errors.username ? [errors.username] : []"
                        required
                    />
                    <FormItemInput
                        id="password"
                        v-model="password"
                        class="md:col-span-6"
                        v-bind="passwordAttrs"
                        type="password"
                        use-show-password
                        :title="$t('users.form.password')"
                        :placeholder="$t('users.form.password_placeholder')"
                        :errors="errors.password ? [errors.password] : []"
                        :required="dialogMode === 'add'"
                    />
                    <FormItemSelect
                        id="role_id"
                        v-model="role_id"
                        class="md:col-span-6"
                        v-bind="role_idAttrs"
                        :title="$t('users.form.role')"
                        :data="resourcesStore.roles"
                        key-value="id"
                        name-value="name"
                        :placeholder="$t('users.form.role_placeholder')"
                        :errors="errors.role_id ? [errors.role_id] : []"
                        required
                    />
                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        class="md:col-span-6"
                        v-bind="isActiveAttrs"
                        :title="$t('users.form.is_active')"
                        :true-label="$t('users.status.active')"
                        :false-label="$t('users.status.inactive')"
                        :errors="errors.isActive ? [errors.isActive] : []"
                    />
                    <FormItemSwitch
                        id="isSuperAdmin"
                        v-model="isSuperAdmin"
                        class="md:col-span-6"
                        v-bind="isSuperAdminAttrs"
                        :title="$t('users.form.is_super_admin')"
                        :true-label="$t('users.role.super_admin')"
                        :false-label="$t('users.role.user')"
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
                    {{ $t('global.actions.cancel') }}
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
                    {{ $t('global.actions.save_and_add_new') }}
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
                    {{ dialogMode === 'add' ? $t('global.actions.save') : $t('global.actions.update') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

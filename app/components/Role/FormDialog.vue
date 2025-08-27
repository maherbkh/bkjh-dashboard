<script setup lang="ts">
import type { Role, RoleForm } from '~/types';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Role, RoleForm>({
    apiSlug: 'role',
    formSchema: createRoleSchema(t),
});

const [name, nameAttrs] = defineField('name');
const [slug, slugAttrs] = defineField('slug');
const [isActive, isActiveAttrs] = defineField('isActive');
const [position, positionAttrs] = defineField('position');
const [permissionIds, permissionIdsAttrs] = defineField('permission_ids');

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingRole?: Role | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingRole: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingRole', value: Role | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: RoleForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new')
        : t('action.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('role.singular')
        : t('action.edit') + ' ' + t('role.singular');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingRole and populate form
watch(() => props.editingRole, (role) => {
    if (role && props.dialogMode === 'edit') {
        setValues({
            name: role.name,
            slug: role.slug,
            is_active: role.is_active,
            position: role.position,
            permission_ids: role.permissions?.map(p => p.id) || [],
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
                    name: '',
                    slug: '',
                    is_active: true,
                    position: 0,
                    permission_ids: [],
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
                    name: '',
                    slug: '',
                    is_active: true,
                    position: 0,
                    permission_ids: [],
                },
            });
        });
    }
});

const onSubmitAndClose = handleSubmit((values) => {
    emit('submitAndClose', values);
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
            class="sm:max-w-6xl max-h-full overflow-y-auto my-5 no-scrollbar-arrows scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin"
        >
            <DialogHeader>
                <DialogTitle>{{ dialogTitle }}</DialogTitle>
                <DialogDescription>
                    {{ dialogDescription }}
                </DialogDescription>
            </DialogHeader>
            <form class="space-y-4">
                <div class="grid md:grid-cols-12 gap-4">
                    <FormItemInput
                        id="name"
                        v-model="name"
                        class="md:col-span-8"
                        v-bind="nameAttrs"
                        :title="$t('global.name')"
                        :placeholder="$t('global.name')"
                        :errors="errors.name ? [errors.name] : []"
                        required
                    />
                    <FormItemInput
                        id="slug"
                        v-model="slug"
                        class="md:col-span-4"
                        v-bind="slugAttrs"
                        :title="$t('global.slug')"
                        :placeholder="$t('global.slug')"
                        :errors="errors.slug ? [errors.slug] : []"
                        :disabled="dialogMode === 'edit'"
                        :readonly="dialogMode === 'edit'"
                    />
                    <FormItemInput
                        id="position"
                        v-model="position"
                        class="md:col-span-6"
                        v-bind="positionAttrs"
                        type="number"
                        :title="$t('position.singular')"
                        :placeholder="$t('position.singular')"
                        :errors="errors.position ? [errors.position] : []"
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
                    <div class="md:col-span-12">
                        <Label class="text-sm font-medium mb-2 block">
                            {{ $t('permission.plural') }}
                        </Label>
                        <PermissionLazyTable
                            v-model="permissionIds"
                            :selected-permissions="editingRole?.permissions?.map(p => p.id) || []"
                            :disabled="isSubmitting"
                        />
                        <div
                            v-if="errors.permission_ids"
                            class="text-destructive text-xs mt-1"
                        >
                            {{ errors.permission_ids }}
                        </div>
                    </div>
                </div>
            </form>
            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    @click="handleClose"
                >
                    {{ $t('action.cancel') }}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="onSubmitAndAddNew"
                >
                    {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
                </Button>
                <Button
                    type="button"
                    :disabled="isSubmitting"
                    @click="onSubmitAndClose"
                >
                    {{ $t('action.save') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

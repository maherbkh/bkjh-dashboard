<script setup lang="ts">
import type { Permission } from '~/types';
import type { PermissionForm } from '~/composables/permissionSchema';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Permission, PermissionForm>({
    apiSlug: 'permission',
    formSchema: createPermissionSchema(t),
});

const [name, nameAttrs] = defineField('name');
const [slug, slugAttrs] = defineField('slug');
const [group, groupAttrs] = defineField('group');
const [module, moduleAttrs] = defineField('module');
const [isActive, isActiveAttrs] = defineField('isActive');
const [position, positionAttrs] = defineField('position');

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingPermission?: Permission | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingPermission: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingPermission', value: Permission | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: PermissionForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('permission.singular')
        : t('action.edit') + ' ' + t('permission.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('permission.add')
        : t('permission.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingPermission and populate form
watch(() => props.editingPermission, (permission) => {
    if (permission && props.dialogMode === 'edit') {
        setValues({
            name: permission.name,
            slug: permission.slug,
            group: permission.group,
            module: permission.module,
            is_active: permission.is_active,
            position: permission.position,
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
                    group: '',
                    module: '',
                    is_active: true,
                    position: 0,
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
                    group: '',
                    module: '',
                    is_active: true,
                    position: 0,
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
            class="sm:max-w-[600px]"
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
                        id="group"
                        v-model="group"
                        class="md:col-span-6"
                        v-bind="groupAttrs"
                        :title="$t('group.singular')"
                        :placeholder="$t('action.select') + ' ' + t('group.singular')"
                        :errors="errors.group ? [errors.group] : []"
                    />
                    <FormItemInput
                        id="module"
                        v-model="module"
                        class="md:col-span-6"
                        v-bind="moduleAttrs"
                        :title="$t('module.singular')"
                        :placeholder="$t('action.select') + ' ' + t('module.singular')"
                        :errors="errors.module ? [errors.module] : []"
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

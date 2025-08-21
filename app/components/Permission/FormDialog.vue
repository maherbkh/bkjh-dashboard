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
        ? t('permissions.add_new')
        : t('permissions.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('permissions.add_description')
        : t('permissions.edit_description');
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
                        :title="$t('permissions.form.name')"
                        :placeholder="$t('permissions.form.name_placeholder')"
                        :errors="errors.name ? [errors.name] : []"
                        required
                    />
                    <FormItemInput
                        id="slug"
                        v-model="slug"
                        class="md:col-span-4"
                        v-bind="slugAttrs"
                        :title="$t('permissions.form.slug')"
                        :placeholder="$t('permissions.form.slug_placeholder')"
                        :errors="errors.slug ? [errors.slug] : []"
                        :disabled="dialogMode === 'edit'"
                        :readonly="dialogMode === 'edit'"
                    />
                    <FormItemInput
                        id="group"
                        v-model="group"
                        class="md:col-span-6"
                        v-bind="groupAttrs"
                        :title="$t('permissions.form.group')"
                        :placeholder="$t('permissions.form.group_placeholder')"
                        :errors="errors.group ? [errors.group] : []"
                    />
                    <FormItemInput
                        id="module"
                        v-model="module"
                        class="md:col-span-6"
                        v-bind="moduleAttrs"
                        :title="$t('permissions.form.module')"
                        :placeholder="$t('permissions.form.module_placeholder')"
                        :errors="errors.module ? [errors.module] : []"
                    />
                    <FormItemInput
                        id="position"
                        v-model="position"
                        class="md:col-span-6"
                        v-bind="positionAttrs"
                        type="number"
                        :title="$t('permissions.form.position')"
                        :placeholder="$t('permissions.form.position_placeholder')"
                        :errors="errors.position ? [errors.position] : []"
                    />
                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        class="md:col-span-6"
                        v-bind="isActiveAttrs"
                        :title="$t('permissions.form.is_active')"
                        :true-label="$t('global.status.active')"
                        :false-label="$t('global.status.inactive')"
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
                    {{ $t('global.actions.cancel') }}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="onSubmitAndAddNew"
                >
                    {{ $t('global.actions.save_and_add_new') }}
                </Button>
                <Button
                    type="button"
                    :disabled="isSubmitting"
                    @click="onSubmitAndClose"
                >
                    {{ $t('global.actions.save') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

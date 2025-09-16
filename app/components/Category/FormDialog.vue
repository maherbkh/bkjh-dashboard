<script setup lang="ts">
import type { Category } from '~/types';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Category, CategoryForm>({
    crudPath: 'ticket-categories',
    tenant: 'support',
    formSchema: createCategorySchema(t),
});

const [name, nameAttrs] = defineField('name');
const [position, positionAttrs] = defineField('position');
const [isActive, isActiveAttrs] = defineField('isActive');
const [parentId, parentIdAttrs] = defineField('parentId');
const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingCategory?: Category | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingCategory: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingCategory', value: Category | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: CategoryForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('category.singular')
        : t('action.edit') + ' ' + t('category.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('category.add')
        : t('category.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingCategory and populate form
watch(() => props.editingCategory, (category) => {
    if (category && props.dialogMode === 'edit') {
        // Add a small delay to prevent focus issues
        nextTick(() => {
            setValues({
                name: category.name,
                position: category.position,
                isActive: category.isActive,
                parentId: category.parentId,
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
                    position: 0,
                    isActive: true,
                    parentId: null,
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
                    position: 0,
                    isActive: true,
                    parentId: null,
                },
            });
        });
    }
});

// Handle form submission with validation
const submitForm = (action: 'submitAndClose' | 'submitAndAddNew') => {
    handleSubmit((values) => {
        // Only emit if validation passes
        emit(action, values as CategoryForm);
    })();
};
</script>

<template>
    <FormDialog
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="dialogDescription"
    >
        <template #content>
            <form @submit.prevent="submitForm('submitAndClose')">
                <div class="grid grid-cols-12 gap-4">
                    <FormItemInput
                        id="name"
                        v-model="name"
                        :title="$t('global.name')"
                        :placeholder="$t('global.name')"
                        class="col-span-8"
                        :errors="errors.name ? [errors.name] : []"
                        v-bind="nameAttrs"
                        required
                    />
                    <FormItemInput
                        id="position"
                        v-model="position"
                        :title="$t('position.singular')"
                        :placeholder="$t('position.placeholder')"
                        type="number"
                        class="col-span-4"
                        :errors="errors.position ? [errors.position] : []"
                        v-bind="positionAttrs"
                        required
                    />
                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        :title="$t('common.status')"
                        :description="$t('status.description')"
                        class="col-span-6"
                        :errors="errors.isActive ? [errors.isActive] : []"
                        v-bind="isActiveAttrs"
                    />
                    <FormItemSelect
                        id="parentId"
                        v-model="parentId"
                        :title="$t('parent.singular')"
                        :placeholder="$t('parent.placeholder')"
                        class="col-span-6"
                        :errors="errors.parentId ? [errors.parentId] : []"
                        v-bind="parentIdAttrs"
                        :options="[]"
                        clearable
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
                variant="outline"
                :disabled="isSubmitting"
                @click="submitForm('submitAndAddNew')"
            >
                <Icon
                    v-if="isSubmitting"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                {{ dialogMode === 'add' ? $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') : $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
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
                {{ dialogMode === 'add' ? $t('action.save') : $t('action.update') }}
            </Button>
        </template>
    </FormDialog>
</template>

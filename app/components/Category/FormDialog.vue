<script setup lang="ts">
import type { Category } from '~/types';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Category, CategoryForm>({
    apiSlug: 'category',
    formSchema: createCategorySchema(t),
});

const [name, nameAttrs] = defineField('name');
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
        ? t('categories.add_new')
        : t('categories.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('categories.add_description')
        : t('categories.edit_description');
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
                        :placeholder="$t('categories.name_placeholder')"
                        class="col-span-12"
                        :errors="errors.name ? [errors.name] : []"
                        v-bind="nameAttrs"
                        required
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
                {{ $t('global.actions.cancel') }}
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
                {{ dialogMode === 'add' ? $t('global.actions.create_and_add_new') : $t('global.actions.update_and_add_new') }}
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
                {{ dialogMode === 'add' ? $t('global.actions.create') : $t('global.actions.update') }}
            </Button>
        </template>
    </FormDialog>
</template>

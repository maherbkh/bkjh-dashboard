<template>
    <Dialog
        :open="isDialogOpen"
        @update:open="(value) => emit('update:isDialogOpen', value)"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                    {{ dialogMode === "add" ? $t("action.add") : $t("action.edit") }}
                    {{ $t("event_category.singular") }}
                </DialogTitle>
                <DialogDescription>
                    {{
                        dialogMode === "add"
                            ? $t("action.add_description", { model: $t("event_category.singular") })
                            : $t("action.edit_description", { model: $t("event_category.singular") })
                    }}
                </DialogDescription>
            </DialogHeader>

            <form
                class="flex min-h-0 flex-1 flex-col"
                @submit.prevent="handleSubmit"
            >
                <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <div class="space-y-2">
                    <Label for="name">{{ $t("global.name") }}</Label>
                    <FormItemInput
                        id="name"
                        v-model="name"
                        :placeholder="$t('event_category.name_placeholder')"
                        :error="errors.name"
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Label for="position">{{ $t("common.position") }}</Label>
                    <FormItemInput
                        id="position"
                        v-model.number="position"
                        type="number"
                        :placeholder="$t('event_category.position_placeholder')"
                        :error="errors.position"
                        min="0"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="parentId">{{ $t("event_category.parent") }}</Label>
                    <FormItemSelect
                        id="parentId"
                        v-model="parentId"
                        :options="parentCategoryOptions"
                        :placeholder="$t('event_category.parent_placeholder')"
                        :error="errors.parentId"
                        clearable
                    />
                </div>

                <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                        <FormItemSwitch
                            id="isActive"
                            v-model="isActive"
                            :error="errors.isActive"
                        />
                        <Label for="isActive">{{ $t("common.active") }}</Label>
                    </div>
                </div>
                </div>

                <DialogFooter class="shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="isSubmitting"
                        @click="handleClose"
                    >
                        {{ $t("action.cancel") }}
                    </Button>
                    <Button
                        v-if="dialogMode === 'add'"
                        type="button"
                        variant="outline"
                        :disabled="isSubmitting"
                        @click="handleSubmitAndAddNew"
                    >
                        {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
                    </Button>
                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                    >
                        <Icon
                            v-if="isSubmitting"
                            name="solar:refresh-linear"
                            class="mr-2 h-4 w-4 animate-spin"
                        />
                        {{
                            dialogMode === "add"
                                ? $t("action.add")
                                : $t("action.update")
                        }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { EventCategory, EventCategoryForm, SelectOption } from '~/types';

const { t } = useI18n();

// Props
const props = defineProps<{
    isDialogOpen: boolean;
    dialogMode: 'add' | 'edit';
    editingEventCategory: EventCategory | null;
    isSubmitting: boolean;
}>();

// Emits — call-signature form so overload resolution works for submit events
const emit = defineEmits<{
    (e: 'update:isDialogOpen', value: boolean): void;
    (e: 'update:dialogMode', value: 'add' | 'edit'): void;
    (e: 'update:editingEventCategory', value: EventCategory | null): void;
    (e: 'submit-and-close' | 'submit-and-add-new', values: EventCategoryForm): void;
    (e: 'close-dialog'): void;
}>();

// CRUD operations for form validation
const {
    defineField,
    handleSubmit: handleFormSubmit,
    errors,
    resetForm,
    setValues,
} = useCrud<EventCategory, EventCategoryForm>({
    crudPath: 'event-categories',
    tenant: 'academy',
    formSchema: createEventCategorySchema(t),
});

// Form fields
const [name] = defineField('name');
const [position] = defineField('position');
const [isActive] = defineField('isActive');
const [parentId] = defineField('parentId');

// Parent category options (for hierarchical structure)
const parentCategoryOptions = ref<SelectOption[]>([]);

// Fetch parent categories for selection
const fetchParentCategories = async () => {
    try {
        const { data } = await useApiFetch<EventCategory[]>('/academy/event-categories/active');

        const list = (data.value as { data?: EventCategory[] } | null)?.data ?? [];
        parentCategoryOptions.value = list.map(category => ({
            value: category.id,
            label: category.name,
        }));
    }
    catch (error) {
        console.error('Error fetching parent categories:', error);
    }
};

// Watch for dialog open to fetch parent categories
watch(() => props.isDialogOpen, (isOpen) => {
    if (isOpen) {
        fetchParentCategories();
    }
});

// Watch for editing event category changes
watch(
    () => props.editingEventCategory,
    (eventCategory) => {
        if (eventCategory) {
            setValues({
                name: eventCategory.name,
                position: eventCategory.position,
                isActive: eventCategory.isActive,
                parentId: eventCategory.parentId,
            });
        }
    },
    { immediate: true },
);

const defaultEventCategoryValues: EventCategoryForm = {
    name: '',
    isActive: true,
    position: 0,
    parentId: null,
};

// Watch for dialog mode changes — reset with explicit values so errors clear (Zod v4 / vee-validate)
watch(
    () => props.dialogMode,
    (mode) => {
        if (mode === 'add') {
            nextTick(() => {
                resetForm({ values: defaultEventCategoryValues });
            });
        }
    },
);

// Clear form when dialog closes
watch(
    () => props.isDialogOpen,
    (isOpen) => {
        if (!isOpen) {
            nextTick(() => {
                resetForm({ values: defaultEventCategoryValues });
            });
        }
    },
);

// Form submission handlers
const handleSubmit = handleFormSubmit((values) => {
    emit('submit-and-close', values as EventCategoryForm);
});

const handleSubmitAndAddNew = handleFormSubmit((values) => {
    emit('submit-and-add-new', values as EventCategoryForm);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

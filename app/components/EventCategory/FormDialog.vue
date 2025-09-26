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
                class="space-y-4"
                @submit.prevent="handleSubmit"
            >
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

                <DialogFooter>
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

// Emits
const emit = defineEmits<{
    'update:isDialogOpen': [value: boolean];
    'update:dialogMode': [value: 'add' | 'edit'];
    'update:editingEventCategory': [value: EventCategory | null];
    'submit-and-close': [values: EventCategoryForm];
    'submit-and-add-new': [values: EventCategoryForm];
    'close-dialog': [];
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
        const { data } = await useApiFetch<{
            data: EventCategory[];
        }>('/academy/event-categories/active');

        parentCategoryOptions.value = data.value?.data?.map(category => ({
            value: category.id,
            label: category.name,
        })) || [];
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

// Watch for dialog mode changes
watch(
    () => props.dialogMode,
    (mode) => {
        if (mode === 'add') {
            resetForm();
        }
    },
);

// Form submission handlers
const handleSubmit = handleFormSubmit((values) => {
    emit('submit-and-close', values);
});

const handleSubmitAndAddNew = handleFormSubmit((values) => {
    emit('submit-and-add-new', values);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

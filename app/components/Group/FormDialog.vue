<script setup lang="ts">
const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm, loading } = useCrud<Group, GroupForm>({
    apiSlug: 'group',
    formSchema: createGroupSchema(t),
});

const [name, nameAttrs] = defineField('name');
const [address_id, addressIdAttrs] = defineField('address_id');
const [company_ids, companyIdsAttrs] = defineField('company_ids');

// Fetch companies and addresses data from API
const { data: companiesData } = useCompaniesList();
const { data: addressesData } = useAddressesList();

type Props = {
    open: boolean;
    editingGroup?: Group | null;
    mode?: 'add' | 'edit';
};

const props = withDefaults(defineProps<Props>(), {
    editingGroup: null,
    mode: 'add',
});

const emit = defineEmits<{
    'update:open': [value: boolean];
    'group-created': [group: Group];
    'group-updated': [group: Group];
}>();

// Computed properties
const dialogMode = computed(() => props.mode);
const dialogTitle = computed(() => {
    return dialogMode.value === 'add'
        ? t('groups.add_group')
        : t('groups.edit_group');
});

const dialogDescription = computed(() => {
    return dialogMode.value === 'add'
        ? t('groups.add_group_description')
        : t('groups.edit_group_description');
});

const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
});

// Watchers
watch(
    () => props.editingGroup,
    (newGroup) => {
        if (newGroup && dialogMode.value === 'edit') {
            setValues({
                name: newGroup.name,
                address_id: newGroup.address_id,
                company_ids: newGroup.company_ids,
            });
        }
    },
    { immediate: true },
);

watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) {
            resetForm();
        }
    },
);

// Methods
const onSubmitAndClose = handleSubmit(async (values) => {
    try {
        if (dialogMode.value === 'add') {
            const newGroup = await $fetch<Group>('/api/groups', {
                method: 'POST',
                body: values,
            });
            emit('group-created', newGroup);
        }
        else {
            const updatedGroup = await $fetch<Group>(`/api/groups/${props.editingGroup?.id}`, {
                method: 'PUT',
                body: values,
            });
            emit('group-updated', updatedGroup);
        }
        handleClose();
    }
    catch (error) {
        console.error('Error submitting group:', error);
    }
});

const onSubmitAndAddNew = handleSubmit(async (values) => {
    try {
        if (dialogMode.value === 'add') {
            const newGroup = await $fetch<Group>('/api/groups', {
                method: 'POST',
                body: values,
            });
            emit('group-created', newGroup);
        }
        else {
            const updatedGroup = await $fetch<Group>(`/api/groups/${props.editingGroup?.id}`, {
                method: 'PUT',
                body: values,
            });
            emit('group-updated', updatedGroup);
        }
        resetForm();
    }
    catch (error) {
        console.error('Error submitting group:', error);
    }
});

const handleClose = () => {
    emit('update:open', false);
};
</script>

<template>
    <FormDialog
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="dialogDescription"
    >
        <template #content>
            <form @submit.prevent="onSubmitAndClose">
                <div class="grid grid-cols-12 gap-4">
                    <FormItemInput
                        id="name"
                        v-model="name"
                        :title="t('groups.name')"
                        :placeholder="t('groups.name_placeholder')"
                        class="col-span-12"
                        :errors="errors.name ? [errors.name] : []"
                        v-bind="nameAttrs"
                        required
                    />

                    <!-- Address Selection -->
                    <FormItemSelect
                        id="address_id"
                        v-model="address_id"
                        :title="t('groups.address')"
                        :placeholder="t('groups.select_address')"
                        class="col-span-12"
                        :errors="errors.address_id ? [errors.address_id] : []"
                        v-bind="addressIdAttrs"
                        :data="addressesData"
                        key-value="id"
                        name-value="street"
                        empty-text="No addresses found"
                    />

                    <!-- Company Selection -->
                    <FormItemMultiSelect
                        id="company_ids"
                        v-model="company_ids"
                        :title="t('groups.companies')"
                        :placeholder="t('groups.select_companies')"
                        class="col-span-12"
                        :errors="errors.company_ids ? [errors.company_ids] : []"
                        v-bind="companyIdsAttrs"
                        :data="companiesData"
                        key-value="id"
                        name-value="street"
                        :search-placeholder="t('groups.search_companies')"
                        :empty-text="t('groups.no_companies_found')"
                    />
                </div>
            </form>
        </template>

        <template #footer>
            <Button
                variant="outline"
                :disabled="loading"
                @click="handleClose"
            >
                {{ t('global.actions.cancel') }}
            </Button>
            <Button
                variant="outline"
                :disabled="loading"
                @click="onSubmitAndAddNew"
            >
                <Icon
                    v-if="loading"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                {{ dialogMode === 'add' ? t('global.actions.create_and_add_new') : t('global.actions.update_and_add_new') }}
            </Button>
            <Button
                :disabled="loading"
                @click="onSubmitAndClose"
            >
                <Icon
                    v-if="loading"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                {{ dialogMode === 'add' ? t('global.actions.create') : t('global.actions.update') }}
            </Button>
        </template>
    </FormDialog>
</template>

<script setup lang="ts">
import { useResourcesStore } from '~/stores/resources'

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm, loading } = useCrud<Group, GroupForm>({
    crudPath: 'groups',
    tenant: 'shared',
    formSchema: createGroupSchema(t),
});

const [name, nameAttrs] = defineField('name');
const [addressId, addressIdAttrs] = defineField('addressId');
const [companyIds, companyIdsAttrs] = defineField('companyIds');

// Get companies and addresses data from resources store
const resourcesStore = useResourcesStore();
const companiesData = computed(() => resourcesStore.companies);
const addressesData = computed(() => resourcesStore.addresses);

type Props = {
    isDialogOpen: boolean;
    dialogMode: 'add' | 'edit';
    editingGroup: Group | null;
    isSubmitting: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    editingGroup: null,
    dialogMode: 'add',
    isSubmitting: false,
});

const emit = defineEmits<{
    'update:is-dialog-open': [value: boolean];
    'update:dialog-mode': [value: 'add' | 'edit'];
    'update:editing-group': [value: Group | null];
    'submit-and-close': [values: GroupForm];
    'submit-and-add-new': [values: GroupForm];
    'close-dialog': [];
}>();

// Computed properties
const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('group.singular')
        : t('action.edit') + ' ' + t('group.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('group.add')
        : t('group.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:is-dialog-open', value),
});

// Watchers
watch(
    () => props.editingGroup,
    (newGroup) => {
        if (newGroup && props.dialogMode === 'edit') {
            setValues({
                name: newGroup.name,
                addressId: newGroup.addressId,
                companyIds: newGroup.companies?.map(c => c.company.id) || [],
            });
        }
    },
    { immediate: true },
);

watch(
    () => props.isDialogOpen,
    (isOpen) => {
        if (!isOpen) {
            resetForm();
        }
    },
);

// Methods
const onSubmitAndClose = handleSubmit((values) => {
    emit('submit-and-close', values);
});

const onSubmitAndAddNew = handleSubmit((values) => {
    emit('submit-and-add-new', values);
});

const handleClose = () => {
    emit('close-dialog');
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
                        :title="t('global.name')"
                        :placeholder="t('global.name')"
                        class="col-span-12"
                        :errors="errors.name ? [errors.name] : []"
                        v-bind="nameAttrs"
                        required
                    />

                    <!-- Address Selection -->
                    <FormItemSelect
                        id="addressId"
                        v-model="addressId"
                        :title="t('address.singular')"
                        :placeholder="t('action.select') + ' ' + t('address.singular')"
                        class="col-span-12"
                        :errors="errors.addressId ? [errors.addressId] : []"
                        v-bind="addressIdAttrs"
                        :data="addressesData"
                        key-value="id"
                        name-value="fullAddress"
                        empty-text="No addresses found"
                    />

                    <!-- Company Selection -->
                    <FormItemMultiSelect
                        id="companyIds"
                        v-model="companyIds"
                        :title="t('company.plural')"
                        :placeholder="t('action.select') + ' ' + t('company.plural')"
                        class="col-span-12"
                        :errors="errors.companyIds ? [errors.companyIds] : []"
                        v-bind="companyIdsAttrs"
                        :data="companiesData"
                        key-value="id"
                        name-value="name"
                        :search-placeholder="t('groups.search_companies')"
                        :empty-text="t('groups.no_companies_found')"
                    />
                </div>
            </form>
        </template>

        <template #footer>
            <Button
                variant="outline"
                :disabled="isSubmitting"
                @click="handleClose"
            >
                {{ t('action.cancel') }}
            </Button>
            <Button
                variant="outline"
                :disabled="isSubmitting"
                @click="onSubmitAndAddNew"
            >
                <Icon
                    v-if="isSubmitting"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                {{ props.dialogMode === 'add' ? t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') : $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
            </Button>
            <Button
                :disabled="isSubmitting"
                @click="onSubmitAndClose"
            >
                <Icon
                    v-if="isSubmitting"
                    name="solar:refresh-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                {{ props.dialogMode === 'add' ? t('action.save') : t('action.update') }}
            </Button>
        </template>
    </FormDialog>
</template>

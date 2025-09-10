<script setup lang="ts">
import { useResourcesStore } from '~/stores/resources'

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Company, CompanyForm>({
    crudPath: 'company',
    tenant: 'shared',
    formSchema: createCompanySchema(t),
});

const [name, nameAttrs] = defineField('name');
const [location, locationAttrs] = defineField('location');
const [register, registerAttrs] = defineField('register');
const [partnerName, partnerNameAttrs] = defineField('partner.name');
const [partnerLocation, partnerLocationAttrs] = defineField('partner.location');
const [partnerRegister, partnerRegisterAttrs] = defineField('partner.register');
const [management, managementAttrs] = defineField('management');
const [addressId, addressIdAttrs] = defineField('addressId');

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingCompany?: Company | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingCompany: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingCompany', value: Company | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: CompanyForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('company.singular')
        : t('action.edit') + ' ' + t('company.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('company.add')
        : t('company.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingCompany and populate form
watch(() => props.editingCompany, (company) => {
    if (company && props.dialogMode === 'edit') {
        setValues({
            name: company.name,
            location: company.location,
            register: company.register,
            partner: {
                name: company.partner.name,
                location: company.partner.location,
                register: company.partner.register,
            },
            management: company.management,
            addressId: company.address?.id || null,
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
                    location: '',
                    register: '',
                    partner: {
                        name: '',
                        location: '',
                        register: '',
                    },
                    management: '',
                    addressId: null,
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
                    location: '',
                    register: '',
                    partner: {
                        name: '',
                        location: '',
                        register: '',
                    },
                    management: '',
                    addressId: null,
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

// Get addresses for the select dropdown from resources store
const resourcesStore = useResourcesStore();
const addresses = computed(() => resourcesStore.addresses);
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-[1024px]">
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
                        class="md:col-span-12"
                        v-bind="nameAttrs"
                        :title="$t('global.name')"
                        :placeholder="$t('global.name')"
                        :errors="errors.name ? [errors.name] : []"
                        required
                    />
                    <FormItemInput
                        id="location"
                        v-model="location"
                        class="md:col-span-6"
                        v-bind="locationAttrs"
                        :title="$t('location.singular')"
                        :placeholder="$t('location.singular')"
                        :errors="errors.location ? [errors.location] : []"
                        required
                    />

                    <FormItemInput
                        id="register"
                        v-model="register"
                        class="md:col-span-6"
                        v-bind="registerAttrs"
                        :title="$t('partner.register')"
                        :placeholder="$t('partner.register')"
                        :errors="errors.register ? [errors.register] : []"
                        required
                    />

                    <FormItemInput
                        id="partnerName"
                        v-model="partnerName"
                        v-bind="partnerNameAttrs"
                        class="md:col-span-6"
                        :title="$t('partner.singular')"
                        :placeholder="$t('partner.singular')"
                        :errors="errors['partner.name'] ? [errors['partner.name']] : []"
                        required
                    />
                    <FormItemInput
                        id="partnerLocation"
                        v-model="partnerLocation"
                        class="md:col-span-6"
                        v-bind="partnerLocationAttrs"
                        :title="$t('partner.singular') + ' ' + $t('location.singular')"
                        :placeholder="$t('partner.singular') + ' ' + $t('location.singular')"
                        :errors="errors['partner.location'] ? [errors['partner.location']] : []"
                        required
                    />

                    <FormItemInput
                        id="partnerRegister"
                        v-model="partnerRegister"
                        class="md:col-span-6"
                        v-bind="partnerRegisterAttrs"
                        :title="$t('partner.register')"
                        :placeholder="$t('partner.register')"
                        :errors="errors['partner.register'] ? [errors['partner.register']] : []"
                        required
                    />

                    <FormItemInput
                        id="management"
                        v-model="management"
                        class="md:col-span-6"
                        v-bind="managementAttrs"
                        :title="$t('global.management')"
                        :placeholder="$t('global.management')"
                        :errors="errors.management ? [errors.management] : []"
                        required
                    />
                    <FormItemSelect
                        id="address-id"
                        v-model="addressId"
                        :title="t('address.singular')"
                        :placeholder="t('action.select') + ' ' + t('address.singular')"
                        class="md:col-span-12"
                        :errors="errors.addressId ? [errors.addressId] : []"
                        v-bind="addressIdAttrs"
                        :data="addresses || []"
                        key-value="id"
                        name-value="fullAddress"
                        empty-text="No addresses found"
                    />
                </div>
            </form>
            <DialogFooter class="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    @click="handleClose"
                >
                    {{ $t('action.cancel') }}
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
                    {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
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
                    {{ dialogMode === 'add' ? $t('action.save') : $t('action.update') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Company, CompanyForm>({
    apiSlug: 'company',
    formSchema: createCompanySchema(t),
});

const [name, nameAttrs] = defineField('name');
const [location, locationAttrs] = defineField('location');
const [register, registerAttrs] = defineField('register');
const [partner, partnerAttrs] = defineField('partner');
const [partnerLocation, partnerLocationAttrs] = defineField('partnerLocation');
const [partnerRegister, partnerRegisterAttrs] = defineField('partnerRegister');
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
        ? t('companies.add_new')
        : t('companies.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('companies.add_description')
        : t('companies.edit_description');
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
            partner: company.partner,
            partnerLocation: company.partnerLocation,
            partnerRegister: company.partnerRegister,
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
                    partner: '',
                    partnerLocation: '',
                    partnerRegister: '',
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
                    partner: '',
                    partnerLocation: '',
                    partnerRegister: '',
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

// Get addresses for the select dropdown
const { data: addresses } = useAddressesList();
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-[600px]">
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
                        :title="$t('companies.form.name')"
                        :placeholder="$t('companies.form.name_placeholder')"
                        :errors="errors.name ? [errors.name] : []"
                        required
                    />
                    <FormItemInput
                        id="location"
                        v-model="location"
                        class="md:col-span-6"
                        v-bind="locationAttrs"
                        :title="$t('companies.form.location')"
                        :placeholder="$t('companies.form.location_placeholder')"
                        :errors="errors.location ? [errors.location] : []"
                        required
                    />

                    <FormItemInput
                        id="register"
                        v-model="register"
                        class="md:col-span-6"
                        v-bind="registerAttrs"
                        :title="$t('companies.form.register')"
                        :placeholder="$t('companies.form.register_placeholder')"
                        :errors="errors.register ? [errors.register] : []"
                        required
                    />

                    <FormItemInput
                        id="partner"
                        v-model="partner"
                        v-bind="partnerAttrs"
                        class="md:col-span-6"
                        :title="$t('companies.form.partner')"
                        :placeholder="$t('companies.form.partner_placeholder')"
                        :errors="errors.partner ? [errors.partner] : []"
                        required
                    />
                    <FormItemInput
                        id="partnerLocation"
                        v-model="partnerLocation"
                        class="md:col-span-6"
                        v-bind="partnerLocationAttrs"
                        :title="$t('companies.form.partner_location')"
                        :placeholder="$t('companies.form.partner_location_placeholder')"
                        :errors="errors.partnerLocation ? [errors.partnerLocation] : []"
                        required
                    />

                    <FormItemInput
                        id="partnerRegister"
                        v-model="partnerRegister"
                        class="md:col-span-6"
                        v-bind="partnerRegisterAttrs"
                        :title="$t('companies.form.partner_register')"
                        :placeholder="$t('companies.form.partner_register_placeholder')"
                        :errors="errors.partnerRegister ? [errors.partnerRegister] : []"
                        required
                    />

                    <FormItemInput
                        id="management"
                        v-model="management"
                        class="md:col-span-6"
                        v-bind="managementAttrs"
                        :title="$t('companies.form.management')"
                        :placeholder="$t('companies.form.management_placeholder')"
                        :errors="errors.management ? [errors.management] : []"
                        required
                    />
                    <FormItemSelect
                        id="address-id"
                        v-model="addressId"
                        :title="t('groups.address')"
                        :placeholder="t('groups.select_address')"
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
                    {{ $t('global.actions.cancel') }}
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
                    {{ $t('global.actions.save_and_add_new') }}
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
                    {{ dialogMode === 'add' ? $t('global.actions.save') : $t('global.actions.update') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

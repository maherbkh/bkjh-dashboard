<script setup lang="ts">
import type { Address } from '~/types';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Address, AddressForm>({
    apiSlug: 'addresses',
    formSchema: createAddressSchema(t),
});

const [street, streetAttrs] = defineField('street');
const [number, numberAttrs] = defineField('number');
const [postalCode, postalCodeAttrs] = defineField('postalCode');
const [city, cityAttrs] = defineField('city');

const props = withDefaults(defineProps<{
    dialogMode?: 'add' | 'edit' | null;
    editingAddress?: Address | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
}>(), {
    dialogMode: null,
    editingAddress: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
});

const emit = defineEmits<{
    (event: 'update:dialogMode', value: 'add' | 'edit'): void;
    (event: 'update:editingAddress', value: Address | null): void;
    (event: 'update:isDialogOpen', value: boolean): void;
    (event: 'submitAndClose' | 'submitAndAddNew', values: AddressForm): void;
    (event: 'closeDialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('addresses.add_new')
        : t('addresses.edit');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add'
        ? t('addresses.add_description')
        : t('addresses.edit_description');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:isDialogOpen', value),
});

// Watch for changes to editingAddress and populate form
watch(() => props.editingAddress, (address) => {
    if (address && props.dialogMode === 'edit') {
        // Add a small delay to prevent focus issues
        nextTick(() => {
            setValues({
                street: address.street,
                number: address.number,
                postalCode: address.postalCode,
                city: address.city,
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
                    street: '',
                    number: '',
                    postalCode: '',
                    city: '',
                },
            });
        });
    }
});

// Clear form when the dialog closes
watch(() => isOpen.value, (isOpen) => {
    if (!isOpen) {
        // Clear form when the dialog closes to prevent focus issues
        nextTick(() => {
            resetForm({
                values: {
                    street: '',
                    number: '',
                    postalCode: '',
                    city: '',
                },
            });
        });
    }
});

// Handle form submission with validation
const submitForm = (action: 'submitAndClose' | 'submitAndAddNew') => {
    handleSubmit((values) => {
        // Only emit if validation passes
        emit(action, values as AddressForm);
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
                        id="street"
                        v-model="street"
                        :title="$t('addresses.street')"
                        :placeholder="$t('addresses.street_placeholder')"
                        class="col-span-8"
                        :errors="errors.street ? [errors.street] : []"
                        v-bind="streetAttrs"
                        required
                    />
                    <FormItemInput
                        id="number"
                        v-model="number"
                        :title="$t('addresses.number')"
                        :placeholder="$t('addresses.number_placeholder')"
                        class="col-span-4"
                        :errors="errors.number ? [errors.number] : []"
                        v-bind="numberAttrs"
                        required
                    />
                    <FormItemInput
                        id="postalCode"
                        v-model="postalCode"
                        :title="$t('addresses.postal_code')"
                        :placeholder="$t('addresses.postal_code_placeholder')"
                        class="col-span-4"
                        :errors="errors.postalCode ? [errors.postalCode] : []"
                        v-bind="postalCodeAttrs"
                        required
                    />
                    <FormItemInput
                        id="city"
                        v-model="city"
                        :title="$t('addresses.city')"
                        :placeholder="$t('addresses.city_placeholder')"
                        class="col-span-8"
                        :errors="errors.city ? [errors.city] : []"
                        v-bind="cityAttrs"
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

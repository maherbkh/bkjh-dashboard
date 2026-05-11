<script setup lang="ts">
import type { Car } from '~/types';
import FormDialogShell from '~/components/FormDialog.vue';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<Car, CarForm>({
    crudPath: 'cars',
    tenant: 'booking',
    formSchema: createCarSchema(t),
});

const [model, modelAttrs] = defineField('model');
const [plateNumber, plateNumberAttrs] = defineField('plateNumber');
const [type, typeAttrs] = defineField('type');
const [automatic, automaticAttrs] = defineField('automatic');
const [isActive, isActiveAttrs] = defineField('isActive');
const [max, maxAttrs] = defineField('max');

type Props = {
    isDialogOpen: boolean;
    dialogMode?: 'add' | 'edit';
    editingCar?: Car | null;
    isSubmitting?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    editingCar: null,
    dialogMode: 'add',
    isSubmitting: false,
});

const emit = defineEmits<{
    (e: 'update:is-dialog-open', value: boolean): void;
    (e: 'update:dialog-mode', value: 'add' | 'edit'): void;
    (e: 'update:editing-car', value: Car | null): void;
    (e: 'submit-and-close' | 'submit-and-add-new', values: CarForm): void;
    (e: 'close-dialog'): void;
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('car.singular')
        : t('action.edit') + ' ' + t('car.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add' ? t('car.add') : t('car.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:is-dialog-open', value),
});

const carTypeOptions = computed(() => [
    { id: 'petrol', name: t('car.types.petrol') },
    { id: 'diesel', name: t('car.types.diesel') },
    { id: 'electric', name: t('car.types.electric') },
    { id: 'hybrid', name: t('car.types.hybrid') },
]);

const shouldShowMax = computed(() => type.value === 'electric' || type.value === 'hybrid');

watch(
    () => props.editingCar,
    (newCar) => {
        if (newCar && props.dialogMode === 'edit') {
            setValues({
                model: newCar.model,
                plateNumber: newCar.plateNumber,
                type: newCar.type,
                automatic: newCar.automatic,
                isActive: newCar.isActive,
                max: newCar.max,
            });
        }
    },
    { immediate: true },
);

const defaultCarValues: CarForm = {
    model: '',
    plateNumber: '',
    type: 'petrol',
    automatic: false,
    isActive: true,
    max: null,
};

watch(
    () => props.isDialogOpen,
    (open) => {
        if (!open) {
            nextTick(() => {
                resetForm({ values: defaultCarValues });
            });
        }
    },
);

watch(
    () => props.dialogMode,
    (newMode, oldMode) => {
        if (newMode === 'add' && (oldMode === 'edit' || oldMode === 'add')) {
            nextTick(() => {
                resetForm({ values: defaultCarValues });
            });
        }
    },
);

watch(type, (newType) => {
    if (newType === 'petrol' || newType === 'diesel') {
        max.value = null;
    }
});

const onSubmitAndClose = handleSubmit((values) => {
    emit('submit-and-close', values as CarForm);
});

const onSubmitAndAddNew = handleSubmit((values) => {
    emit('submit-and-add-new', values as CarForm);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

<template>
    <FormDialogShell
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="dialogDescription"
    >
        <template #content>
            <form @submit.prevent="onSubmitAndClose">
                <div class="grid grid-cols-12 gap-4">
                    <FormItemInput
                        id="model"
                        v-model="model"
                        :title="t('car.model')"
                        :placeholder="t('car.model_placeholder')"
                        class="col-span-12 md:col-span-6"
                        :errors="errors.model ? [errors.model] : []"
                        v-bind="modelAttrs"
                        required
                    />
                    <FormItemInput
                        id="plateNumber"
                        v-model="plateNumber"
                        :title="t('car.plate_number')"
                        :placeholder="t('car.plate_number_placeholder')"
                        class="col-span-12 md:col-span-6"
                        :errors="errors.plateNumber ? [errors.plateNumber] : []"
                        v-bind="plateNumberAttrs"
                        required
                    />
                    <FormItemSelect
                        id="type"
                        v-model="type"
                        :title="t('car.type')"
                        :placeholder="t('action.select') + ' ' + t('car.type')"
                        class="col-span-12 md:col-span-6"
                        :errors="errors.type ? [errors.type] : []"
                        v-bind="typeAttrs"
                        :data="carTypeOptions"
                        key-value="id"
                        name-value="name"
                    />
                    <FormItemInput
                        id="max"
                        v-model.number="max"
                        :title="t('car.max')"
                        :placeholder="t('car.max_placeholder')"
                        type="number"
                        class="col-span-12 md:col-span-6"
                        :errors="errors.max ? [errors.max] : []"
                        v-bind="maxAttrs"
                        :disabled="!shouldShowMax"
                    />
                    <FormItemSwitch
                        id="automatic"
                        v-model="automatic"
                        :title="t('car.automatic')"
                        :description="t('car.automatic_description')"
                        class="col-span-12"
                        :errors="errors.automatic ? [errors.automatic] : []"
                        v-bind="automaticAttrs"
                    />
                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        :title="t('car.is_active')"
                        :description="t('car.is_active_description')"
                        class="col-span-12"
                        :errors="errors.isActive ? [errors.isActive] : []"
                        v-bind="isActiveAttrs"
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
                {{ t('action.save') + ' ' + t('common.and') + ' ' + t('action.add') + ' ' + t('common.new') }}
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
    </FormDialogShell>
</template>

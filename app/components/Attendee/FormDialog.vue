<script setup lang="ts">
import type { Attendee, AttendeeForm } from '~/types';
import { useResourcesStore } from '~/stores/resources';
import BaseFormDialog from '@/components/FormDialog.vue';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm, loading } = useCrud<
    Attendee,
    AttendeeForm
>({
    crudPath: 'attendees',
    tenant: 'academy',
    formSchema: createAttendeeSchema(t),
});

const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [groupId, groupIdAttrs] = defineField('groupId');
const [occupationId, occupationIdAttrs] = defineField('occupationId');
const [isEmployee, isEmployeeAttrs] = defineField('isEmployee');
const [isActive, isActiveAttrs] = defineField('isActive');

// Get groups and occupations data from resources store
const resourcesStore = useResourcesStore();
const groupsData = computed(() => resourcesStore.groups);
const occupationsData = computed(() => resourcesStore.occupations);

type Props = {
    isDialogOpen: boolean;
    dialogMode?: 'add' | 'edit';
    editingAttendee?: Attendee | null;
    isSubmitting?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    editingAttendee: null,
    dialogMode: 'add',
    isSubmitting: false,
});

const emit = defineEmits<{
    (e: 'update:is-dialog-open', value: boolean): void;
    (e: 'update:dialog-mode', value: 'add' | 'edit'): void;
    (e: 'update:editing-attendee', value: Attendee | null): void;
    (e: 'submit-and-close' | 'submit-and-add-new', values: AttendeeForm): void;
    (e: 'close-dialog'): void;
}>();

// Computed properties
const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('attendee.singular')
        : t('action.edit') + ' ' + t('attendee.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add' ? t('attendee.add') : t('attendee.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:is-dialog-open', value),
});

// Watchers
watch(
    () => props.editingAttendee,
    (newAttendee) => {
        if (newAttendee && props.dialogMode === 'edit') {
            setValues({
                firstName: newAttendee.firstName,
                lastName: newAttendee.lastName,
                email: newAttendee.email,
                groupId: newAttendee.groupId,
                occupationId: newAttendee.occupationId,
                isEmployee: newAttendee.isEmployee,
                isActive: newAttendee.isActive,
            });
        }
    },
    { immediate: true },
);

const defaultAttendeeValues: AttendeeForm = {
    firstName: '',
    lastName: '',
    email: '',
    groupId: null,
    occupationId: null,
    isEmployee: false,
    isActive: true,
};

watch(
    () => props.isDialogOpen,
    (isOpen) => {
        if (!isOpen) {
            nextTick(() => {
                resetForm({ values: defaultAttendeeValues });
            });
        }
    },
);

// Reset with explicit values when switching to add (Zod v4 / vee-validate error reset)
watch(
    () => props.dialogMode,
    (newMode, oldMode) => {
        if (newMode === 'add' && (oldMode === 'edit' || oldMode === 'add')) {
            nextTick(() => {
                resetForm({ values: defaultAttendeeValues });
            });
        }
    },
);

// Watch isEmployee to clear group and occupation fields when set to false
watch(isEmployee, (newValue) => {
    if (!newValue) {
        // Clear group and occupation fields when isEmployee is false
        setValues({
            groupId: null,
            occupationId: null,
        });
    }
});

// Methods
const onSubmitAndClose = handleSubmit((values) => {
    emit('submit-and-close', values as AttendeeForm);
});

const onSubmitAndAddNew = handleSubmit((values) => {
    emit('submit-and-add-new', values as AttendeeForm);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

<template>
    <BaseFormDialog
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="dialogDescription"
    >
        <template #content>
            <form @submit.prevent="onSubmitAndClose">
                <div class="grid grid-cols-12 gap-4">
                    <FormItemInput
                        id="firstName"
                        v-model="firstName"
                        :title="t('common.first_name')"
                        :placeholder="t('common.first_name')"
                        class="col-span-6"
                        :errors="errors.firstName ? [errors.firstName] : []"
                        v-bind="firstNameAttrs"
                        required
                    />

                    <FormItemInput
                        id="lastName"
                        v-model="lastName"
                        :title="t('common.last_name')"
                        :placeholder="t('common.last_name')"
                        class="col-span-6"
                        :errors="errors.lastName ? [errors.lastName] : []"
                        v-bind="lastNameAttrs"
                        required
                    />

                    <FormItemInput
                        id="email"
                        v-model="email"
                        :title="t('common.email')"
                        :placeholder="t('common.email')"
                        type="email"
                        class="col-span-12"
                        :errors="errors.email ? [errors.email] : []"
                        v-bind="emailAttrs"
                        required
                    />

                    <!-- Group Selection - Only show if isEmployee is true -->
                    <FormItemSelect
                        v-if="isEmployee"
                        id="groupId"
                        v-model="groupId"
                        :title="t('group.singular')"
                        :placeholder="t('action.select') + ' ' + t('group.singular')"
                        class="col-span-6"
                        :errors="errors.groupId ? [errors.groupId] : []"
                        v-bind="groupIdAttrs"
                        :data="groupsData as any"
                        key-value="id"
                        name-value="name"
                        empty-text="No groups found"
                        required
                    />

                    <!-- Occupation Selection - Only show if isEmployee is true -->
                    <FormItemSelect
                        v-if="isEmployee"
                        id="occupationId"
                        v-model="occupationId"
                        :title="t('occupation.singular')"
                        :placeholder="t('action.select') + ' ' + t('occupation.singular')"
                        class="col-span-6"
                        :errors="errors.occupationId ? [errors.occupationId] : []"
                        v-bind="occupationIdAttrs"
                        :data="occupationsData as any"
                        key-value="id"
                        name-value="name"
                        empty-text="No occupations found"
                        required
                    />

                    <!-- Employee Status -->
                    <FormItemSwitch
                        id="isEmployee"
                        v-model="isEmployee"
                        :title="t('attendee.is_employee')"
                        :description="t('attendee.is_employee_description')"
                        class="col-span-6"
                        :errors="errors.isEmployee ? [errors.isEmployee] : []"
                        v-bind="isEmployeeAttrs"
                    />

                    <!-- Active Status -->
                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        :title="t('common.status')"
                        :description="t('attendee.is_active_description')"
                        class="col-span-6"
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
                {{ t("action.cancel") }}
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
                {{
                    props.dialogMode === "add"
                        ? t("action.save")
                            + " "
                            + $t("common.and")
                            + " "
                            + $t("action.add")
                            + " "
                            + $t("common.new")
                        : $t("action.save")
                            + " "
                            + $t("common.and")
                            + " "
                            + $t("action.add")
                            + " "
                            + $t("common.new")
                }}
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
                {{ props.dialogMode === "add" ? t("action.save") : t("action.update") }}
            </Button>
        </template>
    </BaseFormDialog>
</template>

<script setup lang="ts">
import { useResourcesStore } from '~/stores/resources';
import type { EventData } from '~/types';

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm, loading } = useCrud<
    EventData,
    EventForm
>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

const [title, titleAttrs] = defineField('title');
const [description, descriptionAttrs] = defineField('description');
const [shortDescription, shortDescriptionAttrs] = defineField('shortDescription');
const [note, noteAttrs] = defineField('note');
const [type, typeAttrs] = defineField('type');
const [eventCategoryId, eventCategoryIdAttrs] = defineField('eventCategoryId');
const [eventTargetId, eventTargetIdAttrs] = defineField('eventTargetId');
const [adminId, adminIdAttrs] = defineField('adminId');
const [maxCapacity, maxCapacityAttrs] = defineField('maxCapacity');
const [room, roomAttrs] = defineField('room');
const [location, locationAttrs] = defineField('location');
const [isActive, isActiveAttrs] = defineField('isActive');

// Schedules handled as an array in the parent page if needed; keep simple here

// Resources for selects
const resourcesStore = useResourcesStore();
const eventCategories = computed(() => resourcesStore.eventCategories || []);
const eventTargets = computed(() => resourcesStore.eventTargets || []);

type Props = {
    isDialogOpen: boolean;
    dialogMode?: 'add' | 'edit';
    editingEvent?: EventData | null;
    isSubmitting?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    editingEvent: null,
    dialogMode: 'add',
    isSubmitting: false,
});

const emit = defineEmits<{
    'update:is-dialog-open': [value: boolean];
    'update:dialog-mode': [value: 'add' | 'edit'];
    'update:editing-event': [value: EventData | null];
    'submit-and-close': [values: EventForm];
    'submit-and-add-new': [values: EventForm];
    'close-dialog': [];
}>();

const dialogTitle = computed(() => {
    return props.dialogMode === 'add'
        ? t('action.add') + ' ' + t('common.new') + ' ' + t('event.singular')
        : t('action.edit') + ' ' + t('event.singular');
});

const dialogDescription = computed(() => {
    return props.dialogMode === 'add' ? t('event.add') : t('event.edit');
});

const isOpen = computed({
    get: () => props.isDialogOpen,
    set: (value: boolean) => emit('update:is-dialog-open', value),
});

watch(
    () => props.editingEvent,
    (ev) => {
        if (ev && props.dialogMode === 'edit') {
            setValues({
                title: ev.title,
                description: ev.description,
                shortDescription: ev.shortDescription,
                note: ev.note || undefined,
                type: (ev.type?.toUpperCase?.() || ev.type) as any,
                eventCategoryId: (ev as any).eventCategoryId || (ev as any).categoryId || null,
                eventTargetId: (ev as any).eventTargetId || (ev as any).targetGroupId || null,
                adminId: (ev as any).adminId,
                maxCapacity: (ev as any).maxCapacity ?? (ev as any).maxTrainee ?? 1,
                room: (ev as any).conferenceRoom || ev.room || undefined,
                location: ev.location || undefined,
                isActive: ev.isActive,
            });
        }
    },
    { immediate: true },
);

watch(
    () => props.isDialogOpen,
    (open) => { if (!open) resetForm(); },
);

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
                        id="title"
                        v-model="title"
                        :title="t('event.title')"
                        :placeholder="t('event.title')"
                        class="col-span-12"
                        :errors="errors.title ? [errors.title] : []"
                        v-bind="titleAttrs"
                        required
                    />

                    <FormItemTextarea
                        id="shortDescription"
                        v-model="shortDescription"
                        :title="t('event.short_description')"
                        :placeholder="t('event.short_description')"
                        class="col-span-12"
                        :errors="errors.shortDescription ? [errors.shortDescription] : []"
                        v-bind="shortDescriptionAttrs"
                    />

                    <div class="col-span-12">
                        <label class="block text-sm font-medium mb-2">
                            {{ t('form.description') }}
                        </label>
                        <RTEditor
                            v-model="description"
                            :placeholder="t('form.description')"
                            :show-character-count="true"
                            :max-length="5000"
                            min-height="200px"
                            class="w-full"
                        />
                        <div
                            v-if="errors.description"
                            class="text-sm text-destructive mt-1"
                        >
                            {{ errors.description }}
                        </div>
                    </div>

                    <FormItemSelect
                        id="type"
                        v-model="type"
                        :title="t('event.type')"
                        :placeholder="t('action.select') + ' ' + t('event.type')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.type ? [errors.type] : []"
                        v-bind="typeAttrs"
                        :data="[
                            { id: 'ONLINE', name: 'Online' },
                            { id: 'OFFLINE', name: 'Offline' },
                            { id: 'HYBRID', name: 'Hybrid' },
                        ]"
                        key-value="id"
                        name-value="name"
                        required
                    />

                    <FormItemSelect
                        id="eventCategoryId"
                        v-model="eventCategoryId"
                        :title="t('event_category.singular')"
                        :placeholder="t('action.select') + ' ' + t('event_category.singular')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.eventCategoryId ? [errors.eventCategoryId] : []"
                        v-bind="eventCategoryIdAttrs"
                        :data="eventCategories"
                        key-value="id"
                        name-value="name"
                    />

                    <FormItemSelect
                        id="eventTargetId"
                        v-model="eventTargetId"
                        :title="t('event_target.singular')"
                        :placeholder="t('action.select') + ' ' + t('event_target.singular')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.eventTargetId ? [errors.eventTargetId] : []"
                        v-bind="eventTargetIdAttrs"
                        :data="eventTargets"
                        key-value="id"
                        name-value="name"
                    />

                    <FormItemInput
                        id="adminId"
                        v-model="adminId"
                        :title="t('user.admin')"
                        :placeholder="t('user.admin')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.adminId ? [errors.adminId] : []"
                        v-bind="adminIdAttrs"
                        required
                    />

                    <FormItemInput
                        id="maxCapacity"
                        v-model="maxCapacity"
                        :title="t('event.max_capacity')"
                        :placeholder="t('event.max_capacity')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.maxCapacity ? [errors.maxCapacity] : []"
                        v-bind="maxCapacityAttrs"
                        type="number"
                        min="1"
                        required
                    />

                    <FormItemInput
                        id="room"
                        v-model="room"
                        :title="t('event.room')"
                        :placeholder="t('event.room')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.room ? [errors.room] : []"
                        v-bind="roomAttrs"
                    />

                    <FormItemInput
                        id="location"
                        v-model="location"
                        :title="t('event.location')"
                        :placeholder="t('event.location')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.location ? [errors.location] : []"
                        v-bind="locationAttrs"
                    />

                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        :title="t('common.active')"
                        class="col-span-12"
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
                    props.dialogMode === 'add'
                        ? t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new')
                        : $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new')
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
                {{ props.dialogMode === 'add' ? t('action.save') : t('action.update') }}
            </Button>
        </template>
    </FormDialog>
</template>

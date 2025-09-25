<script setup lang="ts">
import type { EventData } from '~/types';
import type { EventForm } from '~/composables/eventSchema';
import { useResourcesStore } from '~/stores/resources';
import RTEditor from '~/components/FormItem/RTEditor.vue';

const { t } = useI18n();

// Props
interface Props {
    mode: 'add' | 'edit';
    initialData?: EventData | null;
    isSubmitting?: boolean;
    showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    initialData: null,
    isSubmitting: false,
    showActions: true,
});

// Emits
const emit = defineEmits<{
    submit: [values: EventForm];
}>();

// CRUD
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
    EventData,
    EventForm
>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// Form fields
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
const [schedules, schedulesAttrs] = defineField('schedules');

// Resources for selecting
const resourcesStore = useResourcesStore();
const eventCategories = computed(() => resourcesStore.eventCategories || []);
const eventTargets = computed(() => resourcesStore.eventTargets || []);

// Event type options with translated names
const typeOptions = computed(() => {
    const ids = ['ONLINE', 'IN_PERSON', 'HYBRID'] as const;
    return ids.map((id) => ({ id, name: t(`academy.type.${id.toLowerCase()}`) }));
});

// Initialize form data when props change
watch(() => props.initialData, (newData) => {
    if (newData && props.mode === 'edit') {
        setValues({
            title: newData.title,
            description: newData.description,
            shortDescription: newData.shortDescription,
            note: newData.note || undefined,
            type: (newData.type?.toUpperCase?.() || newData.type) as any,
            eventCategoryId: (newData as any).eventCategoryId || (newData as any).categoryId || null,
            eventTargetId: (newData as any).eventTargetId || (newData as any).targetGroupId || null,
            adminId: (newData as any).adminId,
            maxCapacity: (newData as any).maxCapacity ?? (newData as any).maxTrainee ?? 1,
            room: (newData as any).conferenceRoom || newData.room || undefined,
            location: newData.location || undefined,
            isActive: newData.isActive,
            schedules: (newData.schedules || []).map(schedule => ({
                ...schedule,
                date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '',
                startTime: schedule.startTime || '',
                endTime: schedule.endTime || '',
                note: schedule.note || '',
            })),
        });
    }
    else if (props.mode === 'add') {
        resetForm();
    }
}, { immediate: true });

// Form submission
const onSubmit = handleSubmit((values) => {
    emit('submit', values);
});

// Schedule management
const addSchedule = () => {
    schedules.value = [...(schedules.value || []), {
        date: '',
        startTime: '',
        endTime: '',
        note: '',
    }];
};

const removeSchedule = (index: number) => {
    if (!schedules.value || index < 0 || index >= schedules.value.length) return;
    schedules.value = [
        ...schedules.value.slice(0, index),
        ...schedules.value.slice(index + 1),
    ];
};

// Computed properties
const submitButtonText = computed(() => {
    return props.mode === 'add' ? t('action.save') : t('action.update');
});

const formTitle = computed(() => {
    return props.mode === 'add'
        ? `${t('action.add')} ${t('academy.singular')}`
        : `${t('action.edit')} ${t('academy.singular')}`;
});
</script>

<template>
    <div>
        <div class="xl:col-span-8 space-y-6">
            <form
                class="space-y-6"
                @submit.prevent="onSubmit"
            >
                <Card>
                    <CardHeader>
                        <CardTitle class="flex items-start gap-2">
                            <Icon
                                name="solar:clipboard-text-broken"
                                class="!size-5 opacity-75 shrink-0"
                            />
                            Event Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-12 gap-5">
                            <FormItemInput
                                id="title"
                                v-model="title"
                                :title="t('common.title')"
                                :placeholder="t('common.title')"
                                class="col-span-12 lg:col-span-8"
                                :errors="errors.title ? [errors.title] : []"
                                v-bind="titleAttrs"
                                required
                            />
                            <FormItemSwitch
                                id="isActive"
                                v-model="isActive"
                                true-label="Active"
                                false-label="Inactive"
                                :title="t('common.active')"
                                class="col-span-12 lg:col-span-4"
                                v-bind="isActiveAttrs"
                            />
                            <FormItemTextarea
                                id="shortDescription"
                                v-model="shortDescription"
                                :title="t('common.short_description')"
                                :placeholder="t('common.short_description')"
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
                                    :max-length="10000"
                                    min-height="200px"
                                    class="w-full"
                                    :errors="errors.description ? [errors.description] : []"
                                />
                                <div
                                    v-if="errors.description"
                                    class="text-sm text-destructive mt-1"
                                >
                                    {{ errors.description }}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle class="flex items-start gap-2">
                            <Icon
                                name="solar:users-group-two-rounded-line-duotone"
                                class="!size-5 opacity-75 shrink-0"
                            />
                            Teilnehmerinformationen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-12 items-start gap-5">
                            <FormItemSelect
                                id="type"
                                v-model="type"
                                :title="t('event.type')"
                                :placeholder="t('action.select') + ' ' + t('event.type')"
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.type ? [errors.type] : []"
                                v-bind="typeAttrs"
                                :data="typeOptions as any"
                                key-value="id"
                                name-value="name"
                                required
                            />
                            <FormItemSelect
                                id="eventCategoryId"
                                v-model="eventCategoryId"
                                :title="t('event_category.singular')"
                                :placeholder="t('action.select') + ' ' + t('event_category.singular')"
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.eventCategoryId ? [errors.eventCategoryId] : []"
                                v-bind="eventCategoryIdAttrs"
                                :data="eventCategories as any"
                                key-value="id"
                                name-value="name"
                            />
                            <FormItemSelect
                                id="eventTargetId"
                                v-model="eventTargetId"
                                :title="t('event_target.singular')"
                                :placeholder="t('action.select') + ' ' + t('event_target.singular')"
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.eventTargetId ? [errors.eventTargetId] : []"
                                v-bind="eventTargetIdAttrs"
                                :data="eventTargets as any"
                                key-value="id"
                                name-value="name"
                            />
                            <FormItemInput
                                id="maxCapacity"
                                v-model="maxCapacity"
                                :title="t('event.max_capacity')"
                                :placeholder="t('event.max_capacity')"
                                class="col-span-12 lg:col-span-4"
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
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.room ? [errors.room] : []"
                                v-bind="roomAttrs"
                            />
                            <FormItemInput
                                id="location"
                                v-model="location"
                                :title="t('event.location')"
                                :placeholder="t('event.location')"
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.location ? [errors.location] : []"
                                v-bind="locationAttrs"
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle class="flex items-start gap-2">
                            <Icon
                                name="solar:calendar-line-duotone"
                                class="!size-5 opacity-75 shrink-0"
                            />
                            Date & Time Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-12 gap-5">
                            <!-- Schedules Section -->
                            <div class="col-span-12">
                                <label class="block text-sm font-medium mb-2">
                                    {{ t('event.schedules') }}
                                </label>
                                <div class="space-y-4">
                                    <div
                                        v-for="(schedule, index) in schedules"
                                        :key="index"
                                        class="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-muted/50"
                                    >
                                        <FormItemDatePicker
                                            :model-value="schedule.date"
                                            :label="t('event.date')"
                                            :placeholder="t('academy.events.filters.select_date')"
                                            format="yyyy-MM-dd"
                                            :time-picker="false"
                                            :name="`schedule-${index}-date`"
                                            class="col-span-12 lg:col-span-4"
                                            :errors="errors[`schedules.${index}.date`] ? [errors[`schedules.${index}.date`]] : []"
                                            @update:model-value="(value: string | number) => schedule.date = String(value)"
                                        />
                                        <FormItemDatePicker
                                            :model-value="schedule.startTime"
                                            :only-time="true"
                                            :label="t('event.start_time')"
                                            :placeholder="t('event.start_time')"
                                            format="HH:mm"
                                            :name="`schedule-${index}-startTime`"
                                            class="col-span-12 lg:col-span-4"
                                            :errors="errors[`schedules.${index}.startTime`] ? [errors[`schedules.${index}.startTime`]] : []"
                                            @update:model-value="(value: string | number) => schedule.startTime = String(value)"
                                        />
                                        <FormItemDatePicker
                                            :model-value="schedule.endTime"
                                            :only-time="true"
                                            :label="t('event.end_time')"
                                            :placeholder="t('event.end_time')"
                                            format="HH:mm"
                                            :name="`schedule-${index}-endTime`"
                                            class="col-span-12 lg:col-span-4"
                                            :errors="errors[`schedules.${index}.endTime`] ? [errors[`schedules.${index}.endTime`]] : []"
                                            @update:model-value="(value: string | number) => schedule.endTime = String(value)"
                                        />
                                        <FormItemInput
                                            :id="`schedule-${index}-note`"
                                            v-model="schedule.note"
                                            :title="t('note.singular')"
                                            :placeholder="t('note.singular')"
                                            class="col-span-12"
                                            :errors="errors[`schedules.${index}.note`] ? [String(errors[`schedules.${index}.note`] || '')] : []"
                                        />
                                        <div class="col-span-12">
                                            <Button
                                                type="button"
                                                variant="destructive-outline"
                                                class="w-full"
                                                size="sm"
                                                @click="removeSchedule(index)"
                                            >
                                                <Icon
                                                    name="solar:trash-bin-minimalistic-outline"
                                                    class="!size-4.5 shrink-0"
                                                />
                                                {{ t('action.delete') }}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        @click="addSchedule"
                                    >
                                        <Icon
                                            name="solar:add-circle-outline"
                                            class="mr-2 h-4 w-4"
                                        />
                                        {{ t('action.add') }} {{ t('event.schedule') }}
                                    </Button>
                                </div>
                                <div
                                    v-if="errors.schedules"
                                    class="text-sm text-destructive mt-1"
                                >
                                    {{ errors.schedules }}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div
                        v-if="showActions"
                        class="flex justify-end gap-2 pt-4 border-t lg:col-span-12 mb-8"
                    >
                        <Button
                            type="submit"
                            class="w-full"
                            :disabled="isSubmitting"
                        >
                            <Icon
                                v-if="isSubmitting"
                                name="solar:refresh-linear"
                                class="mr-2 !size-5 animate-spin"
                            />
                            {{ submitButtonText }}
                        </Button>
                    </div>
            </form>
        </div>
    </div>
</template>

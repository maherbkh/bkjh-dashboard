<script setup lang="ts">
import type { EventData, Speaker } from '~/types';
import type { EventForm } from '~/composables/eventSchema';
import type { MediaEntity } from '~/types/media/index';
import { AccessLevel, CollectionType } from '~/types/media/index';
import { useResourcesStore } from '~/stores/resources';
import RTEditor from '~/components/FormItem/RTEditor.vue';
import FormItemMedia from '~/components/FormItem/Media.vue';
import FormItemMultiSelect from '~/components/FormItem/MultiSelect.vue';

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
const [eventCategoryIds, eventCategoryIdsAttrs] = defineField('eventCategoryIds');
const [eventTargetIds, eventTargetIdsAttrs] = defineField('eventTargetIds');
const [maxCapacity, maxCapacityAttrs] = defineField('maxCapacity');
const [room, roomAttrs] = defineField('room');
const [location, locationAttrs] = defineField('location');
const [isActive, isActiveAttrs] = defineField('isActive');
const [forKids, forKidsAttrs] = defineField('forKids');
const [disableRegistration, disableRegistrationAttrs] = defineField('disableRegistration');
const [isFull, isFullAttrs] = defineField('isFull');
const [speakers, speakersAttrs] = defineField('speakers');
const [schedules] = defineField('schedules');

// Cover media field - stored as MediaEntity in component, but form schema expects ID
const coverMedia = ref<MediaEntity | null>(null);
const coverId = computed(() => coverMedia.value?.id || null);


// Resources for selecting
const resourcesStore = useResourcesStore();
const eventCategories = computed(() => resourcesStore.eventCategories || []);
const eventTargets = computed(() => resourcesStore.eventTargets || []);

// Fetch speakers for multi-select
const { data: speakersListData, status: isLoadingSpeakers } = await useApiFetch<{ data: Speaker[] }>('/academy/speakers/active', {
    server: false,
});

// Event type options with translated names
const typeOptions = computed(() => {
    const ids = ['ONLINE', 'IN_PERSON', 'HYBRID'] as const;
    return ids.map(id => ({ id, name: t(`academy.type.${id.toLowerCase()}`) }));
});

// Initialize form data when props change
watch(() => props.initialData, async (newData) => {
    if (newData && (props.mode === 'edit' || (props.mode === 'add' && newData))) {
        // Handle cover media - could be ID string or MediaEntity object
        let coverEntity: MediaEntity | null = null;
        const coverData = (newData as any).cover;
        const coverUrl = (newData as any).coverUrl;
        
        if (coverData) {
            if (typeof coverData === 'string') {
                // If it's an ID, fetch the media entity
                try {
                    const { data, error } = await useApiFetch<{ success: boolean; message: string; data: MediaEntity }>(`/shared/media/${coverData}`, {
                        server: false,
                    });
                    
                    if (error.value) {
                        console.error('Error fetching cover media:', error.value);
                        // If fetch fails but we have coverUrl, create a minimal entity
                        if (coverUrl) {
                            coverEntity = {
                                id: coverData,
                                uuid: coverData,
                                filename: '',
                                storedName: '',
                                path: '',
                                url: coverUrl,
                                mimeType: 'image/png',
                                extension: '.png',
                                size: 0,
                                metadata: {},
                                accessLevel: AccessLevel.PUBLIC,
                            } as MediaEntity;
                        }
                    }
                    else if (data.value?.data) {
                        coverEntity = data.value.data;
                        // Ensure url field is set from coverUrl if available
                        if (coverUrl && !coverEntity.url) {
                            coverEntity = {
                                ...coverEntity,
                                url: coverUrl,
                            } as MediaEntity;
                        }
                    }
                    // Fallback: if fetch didn't return data but we have coverUrl, create minimal entity
                    else if (coverUrl) {
                        coverEntity = {
                            id: coverData,
                            uuid: coverData,
                            filename: '',
                            storedName: '',
                            path: '',
                            url: coverUrl,
                            mimeType: 'image/png',
                            extension: '.png',
                            size: 0,
                            metadata: {},
                            accessLevel: AccessLevel.PUBLIC,
                        } as MediaEntity;
                    }
                }
                catch (error) {
                    console.error('Error fetching cover media:', error);
                    // Fallback: create minimal entity from coverUrl if available
                    if (coverUrl) {
                        coverEntity = {
                            id: coverData,
                            uuid: coverData,
                            filename: '',
                            storedName: '',
                            path: '',
                            url: coverUrl,
                            mimeType: 'image/png',
                            extension: '.png',
                            size: 0,
                            metadata: {},
                            accessLevel: AccessLevel.PUBLIC,
                        } as MediaEntity;
                    }
                }
            }
            else if (coverData.id) {
                // If it's already a MediaEntity object
                coverEntity = coverData as MediaEntity;
            }
        }
        // If no cover data but we have coverUrl, try to construct from URL
        else if (coverUrl && typeof coverUrl === 'string') {
            // Extract ID from URL or use a placeholder
            const urlParts = coverUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const uuidMatch = filename.match(/^([a-f0-9-]+)/);
            const uuid = uuidMatch ? uuidMatch[1] : '';
            
            coverEntity = {
                id: uuid || '',
                uuid: uuid || '',
                filename: filename,
                storedName: filename,
                path: coverUrl.replace('http://api.backhaus.test:3055/', ''),
                url: coverUrl,
                mimeType: 'image/png',
                extension: filename.split('.').pop() || '.png',
                size: 0,
                metadata: {},
                accessLevel: AccessLevel.PUBLIC,
            } as MediaEntity;
        }

        // Set coverMedia after ensuring we have a valid entity
        // Use nextTick to ensure reactivity
        await nextTick();
        if (coverEntity) {
            // Ensure all required fields are present for preview
            const validEntity: MediaEntity = {
                id: coverEntity.id || '',
                uuid: coverEntity.uuid || coverEntity.id || '',
                filename: coverEntity.filename || '',
                storedName: coverEntity.storedName || coverEntity.filename || '',
                path: coverEntity.path || '',
                url: coverEntity.url || coverUrl || '',
                mimeType: coverEntity.mimeType || 'image/png',
                extension: coverEntity.extension || '.png',
                size: typeof coverEntity.size === 'string' ? parseInt(coverEntity.size) : (coverEntity.size || 0),
                metadata: coverEntity.metadata || {},
                accessLevel: coverEntity.accessLevel || AccessLevel.PUBLIC,
            } as MediaEntity;
            
            // Force reactivity by creating a new object reference
            coverMedia.value = { ...validEntity };
        }
        else {
            coverMedia.value = null;
        }

        // Extract category and target IDs from new response structure
        const categoryIds = (newData as any).categories
            ? (newData as any).categories.map((cat: any) => cat.eventCategory?.id || cat.eventCategoryId || cat.id).filter(Boolean)
            : (newData as any).eventCategoryIds || ((newData as any).eventCategoryId ? [(newData as any).eventCategoryId] : []);
        
        const targetIds = (newData as any).targets
            ? (newData as any).targets.map((target: any) => target.eventTarget?.id || target.eventTargetId || target.id).filter(Boolean)
            : (newData as any).eventTargetIds || ((newData as any).eventTargetId ? [(newData as any).eventTargetId] : []);

        setValues({
            title: newData.title,
            description: newData.description,
            shortDescription: newData.shortDescription,
            note: newData.note || undefined,
            type: (newData.type?.toUpperCase?.() || newData.type) as any,
            eventCategoryIds: categoryIds.length > 0 ? categoryIds : [],
            eventTargetIds: targetIds.length > 0 ? targetIds : [],
            adminId: (newData as any).adminId,
            maxCapacity: (newData as any).maxCapacity ?? (newData as any).maxTrainee ?? 1,
            room: (newData as any).conferenceRoom || newData.room || undefined,
            location: newData.location || undefined,
            isActive: newData.isActive,
            forKids: (newData as any).forKids ?? false,
            disableRegistration: (newData as any).disableRegistration ?? false,
            isFull: (newData as any).isFull ?? false,
            cover: coverEntity?.id || null,
            speakers: (newData.speakers || []).map((speaker: any) => speaker.speakerId || speaker.id),
            schedules: (newData.schedules || []).map(schedule => ({
                ...schedule,
                date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '',
                startTime: schedule.startTime || '',
                endTime: schedule.endTime || '',
                note: schedule.note || '',
            })),
        });
    }
    else if (props.mode === 'add' && !newData) {
        resetForm();
        coverMedia.value = null;
    }
}, { immediate: true });

// Form submission
const onSubmit = handleSubmit((values) => {
    // Transform cover MediaEntity to ID for submission
    const submitValues = {
        ...values,
        cover: coverId.value,
    };
    emit('submit', submitValues as EventForm);
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
                                class="col-span-12 lg:col-span-6"
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
                                class="col-span-12 lg:col-span-3"
                                v-bind="isActiveAttrs"
                            />
                            <FormItemSwitch
                                id="forKids"
                                v-model="forKids"
                                true-label="Ja"
                                false-label="Nein"
                                :title="t('event.for_kids')"
                                class="col-span-12 lg:col-span-3"
                                v-bind="forKidsAttrs"
                            />
                            <FormItemSwitch
                                id="disableRegistration"
                                v-model="disableRegistration"
                                true-label="Ja"
                                false-label="Nein"
                                :title="t('event.disable_registration')"
                                class="col-span-12 lg:col-span-3"
                                v-bind="disableRegistrationAttrs"
                            />
                            <FormItemSwitch
                                id="isFull"
                                v-model="isFull"
                                true-label="Ja"
                                false-label="Nein"
                                :title="t('event.is_full')"
                                class="col-span-12 lg:col-span-3"
                                v-bind="isFullAttrs"
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

                            <FormItemTextarea
                                id="eventNote"
                                v-model="note"
                                :title="t('note.singular')"
                                :placeholder="t('note.singular')"
                                class="col-span-12"
                                :errors="errors.note ? [errors.note] : []"
                                v-bind="noteAttrs"
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
                            <FormItemMedia
                                id="cover"
                                v-model="coverMedia"
                                :label="t('event.cover') || 'Cover Image'"
                                name="cover"
                                :multiple="false"
                                :max-files="1"
                                :allowed-types="['image']"
                                :access-level="AccessLevel.PUBLIC"
                                :collection-name="CollectionType.COVER"
                                :errors="errors.cover ? [errors.cover] : []"
                                class="col-span-12"
                            />
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
                                :searchable="false"
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
                            <FormItemMultiSelect
                                id="eventCategoryIds"
                                v-model="eventCategoryIds"
                                :title="t('event_category.singular')"
                                :placeholder="t('action.select') + ' ' + t('event_category.singular')"
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.eventCategoryIds ? [errors.eventCategoryIds] : []"
                                v-bind="eventCategoryIdsAttrs"
                                :data="eventCategories as any"
                                item-key="id"
                                item-label="name"
                                :max="10"
                                required
                            />
                            <FormItemMultiSelect
                                id="eventTargetIds"
                                v-model="eventTargetIds"
                                :title="t('event_target.singular')"
                                :placeholder="t('action.select') + ' ' + t('event_target.singular')"
                                class="col-span-12 lg:col-span-4"
                                :errors="errors.eventTargetIds ? [errors.eventTargetIds] : []"
                                v-bind="eventTargetIdsAttrs"
                                :data="eventTargets as any"
                                item-key="id"
                                item-label="name"
                                :max="10"
                                required
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
                <Card v-if="isLoadingSpeakers !== 'pending'">
                    <CardHeader>
                        <CardTitle class="flex items-start gap-2">
                            <Icon
                                name="solar:user-speak-rounded-line-duotone"
                                class="!size-5 opacity-75 shrink-0"
                            />
                            {{ $t('academy.speakers') }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-12 gap-5">
                            <LazyFormItemMultiSelect
                                id="speakers"
                                v-model="speakers"
                                :title="$t('academy.speakers')"
                                :placeholder="$t('action.select') + ' ' + $t('academy.speakers')"
                                class="col-span-12"
                                :errors="errors.speakers ? [errors.speakers] : []"
                                v-bind="speakersAttrs"
                                :data="speakersListData?.data || []"
                                item-key="id"
                                item-label="name"
                            />
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

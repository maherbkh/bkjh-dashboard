<script setup lang="ts">
import type { EventData, Speaker } from '~/types';
import type { EventForm } from '~/composables/eventSchema';
import type { MediaEntity } from '~/types/media/index';
import { AccessLevel, CollectionType } from '~/types/media/index';
import { useResourcesStore } from '~/stores/resources';
import RTEditor from '~/components/FormItem/RTEditor.vue';
import FormItemMedia from '~/components/FormItem/Media.vue';
import FormItemMultiSelect from '~/components/FormItem/MultiSelect.vue';
import FormItemInput from '~/components/FormItem/Input.vue';
import FormItemTextarea from '~/components/FormItem/Textarea.vue';
import FormItemArrayInput from '~/components/FormItem/ArrayInput.vue';
import EventQuestions from '~/components/Event/Question/index.vue';
import { prepareQuestionsForSubmit } from '~/composables/useEventQuestions';

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

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
const { defineField, errors, setValues, handleSubmit, resetForm, validateField, setFieldValue } = useCrud<
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
const [certNote, certNoteAttrs] = defineField('certNote');
const [topics, topicsAttrs] = defineField('topics');
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
const [questions] = defineField('questions');

// Cover media field - stored as MediaEntity in component, but form schema expects ID
const coverMedia = ref<MediaEntity | null>(null);
const coverId = computed(() => coverMedia.value?.id || null);

// Resources for selecting
const resourcesStore = useResourcesStore();
const eventCategories = computed(() => resourcesStore.eventCategories || []);
const eventTargets = computed(() => resourcesStore.eventTargets || []);

// Fetch speakers for multi-select
const { data: speakersListData, status: isLoadingSpeakers } = await useApiFetch<Speaker[]>('/academy/speakers/active', {
    server: false,
});

const speakersList = computed<Speaker[]>(() => {
    const raw = speakersListData.value as { data?: Speaker[] } | null;
    return raw?.data ?? [];
});

// Event type options with translated names
const typeOptions = computed(() => {
    const ids = ['ONLINE', 'IN_PERSON', 'HYBRID'] as const;
    return ids.map(id => ({ id, name: t(`academy.type.${id.toLowerCase()}`) }));
});

// Initialize form data when props change
watch(() => props.initialData, async (newData) => {
    // Ensure topics is always initialized as empty array if not provided
    if (!newData && props.mode === 'add') {
        topics.value = [];
    }
    if (newData && (props.mode === 'edit' || (props.mode === 'add' && newData))) {
        // Handle cover media - could be ID string or MediaEntity object
        let coverEntity: MediaEntity | null = null;
        const coverData = (newData as any).cover;
        const coverUrl = (newData as any).coverUrl;

        if (coverData) {
            if (typeof coverData === 'string') {
                // If it's an ID, fetch the media entity
                try {
                    const { data, error } = await useApiFetch<MediaEntity>(`/shared/media/${coverData}`, {
                        server: false,
                    });

                    const fetchedData = (data.value as { data?: MediaEntity } | null)?.data;

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
                    else if (fetchedData) {
                        coverEntity = fetchedData;
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
            const filename = urlParts[urlParts.length - 1] ?? '';
            const uuidMatch = filename.match(/^([a-f0-9-]+)/);
            const uuid = uuidMatch ? uuidMatch[1] : '';
            const apiOrigin = `${new URL(runtimeConfig.public.apiBaseUrl as string).origin}/`;

            coverEntity = {
                id: uuid || '',
                uuid: uuid || '',
                filename: filename,
                storedName: filename,
                path: coverUrl.replace(apiOrigin, ''),
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
            certNote: (newData as any).certNote || undefined,
            topics: Array.isArray((newData as any).topics) ? (newData as any).topics : [],
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
            questions: (newData as any).questions || [],
        });

        // Ensure topics is always an array after setValues
        await nextTick();
        if (!Array.isArray(topics.value)) {
            topics.value = [];
        }
    }
    else if (props.mode === 'add' && !newData) {
        resetForm();
        coverMedia.value = null;
        questions.value = []; // Start with empty questions array
    }
}, { immediate: true });

// Form submission
const onSubmit = handleSubmit((values) => {
    // Get topics directly from the reactive field, not from validated values
    // Filter out empty strings and ensure it's always an array
    let topicsArray: string[] = [];
    if (Array.isArray(topics.value)) {
        topicsArray = topics.value
            .map(t => String(t || '').trim())
            .filter(t => t.length > 0);
    }

    // Prepare questions for submission (ensure IDs, validate positions)
    const preparedQuestions = prepareQuestionsForSubmit(questions.value || []);

    // Transform cover MediaEntity to ID for submission
    const submitValues: any = {
        ...values,
        cover: coverId.value,
        topics: topicsArray, // Always include as array, even if empty
        questions: preparedQuestions, // Include prepared questions
    };

    console.log('Submitting topics:', topicsArray); // Debug log
    console.log('Submitting questions:', preparedQuestions); // Debug log

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

// Step navigation (0–6)
const currentStep = ref(0);
const TOTAL_STEPS = 7;
const stepDirection = ref(1); // 1 = forward (next), -1 = backward (prev)

// Fields validated per step (must pass before continuing to next)
const STEP_FIELDS: (keyof EventForm)[][] = [
    ['title', 'description', 'shortDescription', 'note', 'isActive', 'forKids', 'disableRegistration', 'isFull'],
    ['cover'],
    ['type', 'eventCategoryIds', 'eventTargetIds', 'maxCapacity', 'room', 'location'],
    ['schedules'],
    ['speakers'],
    ['questions'],
    ['topics', 'certNote'],
];

async function goToNextStep() {
    if (currentStep.value >= TOTAL_STEPS - 1) return;
    const fields = STEP_FIELDS[currentStep.value];
    if (fields && fields.length > 0) {
        if (currentStep.value === 1) {
            setFieldValue('cover', coverId.value);
        }
        for (const name of fields) {
            const result = await validateField(name as string);
            if (!result.valid) return;
        }
    }
    currentStep.value++;
}

watch(currentStep, (next, prev) => {
    stepDirection.value = next > (prev ?? 0) ? 1 : -1;
});

// Subtle slide: short distance (20%) so it feels in-place, not from far away
const slideOffset = computed(() =>
    stepDirection.value === 1
        ? { enter: ['10%', 0] as [string | number, number], leave: ['-10%', 0] as [string | number, number] }
        : { enter: ['-10%', 0] as [string | number, number], leave: ['10%', 0] as [string | number, number] },
);

const stepLabels = computed(() => [
    { id: 0, label: t('event.form.steps.details') },
    { id: 1, label: t('event.form.steps.cover_image') },
    { id: 2, label: t('event.form.steps.participant_info') },
    { id: 3, label: t('event.form.steps.date_time_management') },
    { id: 4, label: t('event.form.steps.speakers') },
    { id: 5, label: t('event.form.steps.questions') },
    { id: 6, label: t('event.form.steps.certificate_content') },
]);

// Step indices that have validation errors (for stepper error state)
const stepsWithErrors = computed(() => {
    const indices: number[] = [];
    STEP_FIELDS.forEach((fields, index) => {
        const hasError = fields.some(f => errors.value[f]);
        if (hasError) indices.push(index);
    });
    return indices;
});

const isSaveDisabled = computed(
    () =>
        props.isSubmitting
        || currentStep.value !== TOTAL_STEPS - 1
        || stepsWithErrors.value.length > 0,
);

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
    <div class="overflow-x-hidden">
        <div class="xl:col-span-8 space-y-4 min-w-0">
            <form
                class="space-y-6 overflow-x-hidden min-w-0"
                @submit.prevent="onSubmit"
            >
                <EventFormStepper
                    v-model="currentStep"
                    :steps="stepLabels"
                    :steps-with-errors="stepsWithErrors"
                />

                <div
                    v-if="showActions"
                    class="flex w-full items-center justify-between gap-2 py-3"
                >
                    <div class="min-w-0 flex-1 flex justify-start">
                        <Button
                            v-show="currentStep > 0"
                            type="button"
                            variant="outline"
                            @click="currentStep--"
                        >
                            <Icon
                                name="solar:arrow-left-outline"
                                class="mr-2 size-5!"
                            />
                            {{ t('common.previous') }}
                        </Button>
                    </div>
                    <div class="min-w-0 flex-1 flex justify-end">
                        <Button
                            v-show="currentStep < TOTAL_STEPS - 1"
                            type="button"
                            variant="outline"
                            @click="goToNextStep"
                        >
                            {{ t('common.next') }}
                            <Icon
                                name="solar:arrow-right-outline"
                                class="ml-2 size-5!"
                            />
                        </Button>
                    </div>
                </div>

                <div class="relative overflow-x-hidden min-w-0">
                    <TransitionSlide
                        mode="out-in"
                        :offset="slideOffset"
                        :duration="150"
                    >
                        <div :key="currentStep">
                            <!-- Step 0: Event Details -->
                            <CompactCard
                                v-if="currentStep === 0"
                                icon="solar:clipboard-text-outline"
                                :title="t('event.form.steps.details')"
                            >
                                <div class="grid grid-cols-12 items-start gap-5">
                                    <FormItemInput
                                        id="title"
                                        v-model="title"
                                        :title="t('common.title')"
                                        :placeholder="t('common.title')"
                                        class="col-span-12"
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
                                        class="col-span-12 lg:col-span-6"
                                        :errors="errors.shortDescription ? [errors.shortDescription] : []"
                                        v-bind="shortDescriptionAttrs"
                                    />
                                    <FormItemTextarea
                                        id="eventNote"
                                        v-model="note"
                                        :title="t('note.singular')"
                                        :placeholder="t('note.singular')"
                                        class="col-span-12 lg:col-span-6"
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
                                </div>
                            </CompactCard>

                            <!-- Step 1: Cover Image Uploader -->
                            <CompactCard
                                v-else-if="currentStep === 1"
                                icon="solar:gallery-outline"
                                :title="t('event.form.steps.cover_image')"
                            >
                                <div class="grid grid-cols-12 items-start gap-5">
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
                            </CompactCard>

                            <!-- Step 2: Participant Information -->
                            <CompactCard
                                v-else-if="currentStep === 2"
                                icon="solar:users-group-two-rounded-outline"
                                :title="t('event.form.steps.participant_info')"
                            >
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
                            </CompactCard>

                            <!-- Step 3: Date and Time Management -->
                            <CompactCard
                                v-else-if="currentStep === 3"
                                icon="solar:calendar-outline"
                                :title="t('event.form.steps.date_time_management')"
                            >
                                <div class="grid grid-cols-12 items-start gap-5">
                                    <div class="col-span-12">
                                        <label class="block text-sm font-medium mb-2">
                                            {{ t('event.schedules') }}
                                        </label>
                                        <div class="space-y-4">
                                            <div
                                                v-for="(schedule, index) in schedules"
                                                :key="index"
                                                class="grid grid-cols-12 items-start gap-4 p-4 border rounded-lg bg-muted/50"
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
                                                        @click="removeSchedule(Number(index))"
                                                    >
                                                        <Icon
                                                            name="solar:trash-bin-minimalistic-outline"
                                                            class="size-4.5! shrink-0"
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
                            </CompactCard>

                            <!-- Step 4: Speakers -->
                            <template v-else-if="currentStep === 4">
                                <CompactCard
                                    v-if="isLoadingSpeakers !== 'pending'"
                                    icon="solar:user-speak-rounded-outline"
                                    :title="t('event.form.steps.speakers')"
                                >
                                    <div class="grid grid-cols-12 items-start gap-5">
                                        <LazyFormItemMultiSelect
                                            id="speakers"
                                            v-model="speakers"
                                            :placeholder="t('action.select') + ' ' + t('academy.speakers')"
                                            class="col-span-12"
                                            :errors="errors.speakers ? [errors.speakers] : []"
                                            v-bind="speakersAttrs"
                                            :data="speakersList"
                                            item-key="id"
                                            item-label="name"
                                        />
                                    </div>
                                </CompactCard>
                            </template>

                            <!-- Step 5: Questions -->
                            <CompactCard
                                v-else-if="currentStep === 5"
                                icon="solar:question-circle-outline"
                                :title="t('event.form.steps.questions')"
                            >
                                <EventQuestions
                                    v-model="questions"
                                    :errors="errors.questions ? { questions: Array.isArray(errors.questions) ? errors.questions : [errors.questions] } : {}"
                                />
                            </CompactCard>

                            <!-- Step 6: Certificate Generation content -->
                            <CompactCard
                                v-else-if="currentStep === 6"
                                icon="solar:document-text-outline"
                                :title="t('event.form.steps.certificate_content')"
                            >
                                <div class="grid grid-cols-12 items-start gap-5">
                                    <FormItemArrayInput
                                        id="topics-cert"
                                        v-model="topics"
                                        :title="t('event.topics') || 'Topics'"
                                        :placeholder="t('event.topic_placeholder') || 'Enter topic'"
                                        class="col-span-12"
                                        :errors="errors.topics ? [errors.topics] : []"
                                        :add-button-text="t('action.add') + ' ' + (t('event.topic') || 'Topic')"
                                        item-id-prefix="topic-cert"
                                    />
                                    <FormItemTextarea
                                        id="certNote"
                                        v-model="certNote"
                                        :title="t('event.cert_note') || 'Certificate Note'"
                                        :placeholder="t('event.cert_note_description') || 'This content will be shown only in Certificate generation process'"
                                        class="col-span-12"
                                        :errors="errors.certNote ? [errors.certNote] : []"
                                        v-bind="certNoteAttrs"
                                        :rows="4"
                                    />
                                </div>
                            </CompactCard>
                        </div>
                    </TransitionSlide>
                </div>

                <div
                    v-if="showActions"
                    class="flex flex-wrap items-center justify-end gap-2 pt-4 border-t lg:col-span-12 mb-8"
                >
                    <Button
                        type="submit"
                        class="w-full sm:w-auto"
                        :disabled="isSaveDisabled"
                    >
                        <Icon
                            v-if="isSubmitting"
                            name="solar:refresh-outline"
                            class="mr-2 size-5! animate-spin"
                        />
                        {{ submitButtonText }}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>

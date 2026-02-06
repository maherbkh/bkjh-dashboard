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
import EventWorkshopList from '~/components/Event/WorkshopList.vue';

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

// Props
interface Props {
    mode: 'add' | 'edit';
    initialData?: EventData | null;
    isSubmitting?: boolean;
    showActions?: boolean;
    /** Initial step index from URL (e.g. from ?step=cover). Clamped to valid range. */
    initialStep?: number;
    /** When true (e.g. from ?collection=1 after add), treat as collection so workshops step/slug work even if event has 0 workshops yet. */
    forceEventCollection?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    initialData: null,
    isSubmitting: false,
    showActions: true,
    initialStep: undefined,
    forceEventCollection: false,
});

// Emits
const emit = defineEmits<{
    submit: [values: EventForm, options?: { isEventCollection: boolean; workshopCount: number }];
    stepChange: [index: number, slug: string];
}>();

// CRUD
const {
    defineField,
    errors,
    setValues,
    handleSubmit,
    resetForm,
    validateField,
    setFieldValue,
} = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// Form fields
const [title, titleAttrs] = defineField('title');
const [description, descriptionAttrs] = defineField('description');
const [shortDescription, shortDescriptionAttrs]
    = defineField('shortDescription');
const [certNote, certNoteAttrs] = defineField('certNote');
const [topics, topicsAttrs] = defineField('topics');
const [note, noteAttrs] = defineField('note');
const [type, typeAttrs] = defineField('type');
const [eventCategoryIds, eventCategoryIdsAttrs]
    = defineField('eventCategoryIds');
const [eventTargetIds, eventTargetIdsAttrs] = defineField('eventTargetIds');
const [maxCapacity, maxCapacityAttrs] = defineField('maxCapacity');
const [room, roomAttrs] = defineField('room');
const [location, locationAttrs] = defineField('location');
const [isActive, isActiveAttrs] = defineField('isActive');
const [forKids, forKidsAttrs] = defineField('forKids');
const [disableRegistration, disableRegistrationAttrs] = defineField(
    'disableRegistration',
);
const [isFull, isFullAttrs] = defineField('isFull');
const [speakers, speakersAttrs] = defineField('speakers');
const [schedules] = defineField('schedules');
const [questions] = defineField('questions');

// Frontend-only: event is a collection (with workshops). Not sent to backend.
const isEventCollection = ref(false);
// Workshop count from WorkshopList (for step validation: 0 or ≥2)
const workshopCount = ref(0);

// Init isEventCollection and workshopCount: add => false; edit => from backend isEventCollection or forceEventCollection or hasWorkshops
watch(
    [() => props.initialData, () => props.forceEventCollection],
    ([newData, forceCol]) => {
        if (props.mode === 'edit' && newData) {
            const workshops = (newData as any).workshops;
            const hasWorkshops = Array.isArray(workshops) && workshops.length > 0;
            const fromBackend = (newData as any).isEventCollection;
            isEventCollection.value = fromBackend ?? (!!forceCol || hasWorkshops);
            workshopCount.value = Array.isArray(workshops) ? workshops.length : 0;
        }
        else if (props.mode === 'edit' && forceCol) {
            isEventCollection.value = true;
            workshopCount.value = 0;
        }
        else if (props.mode === 'add' && !newData) {
            isEventCollection.value = false;
            workshopCount.value = 0;
        }
    },
    { immediate: true },
);

// When forKids or disableRegistration is true, force isEventCollection to false
watch([forKids, disableRegistration], ([fk, dr]) => {
    if (fk || dr) isEventCollection.value = false;
});

// When isEventCollection is true, lock maxCapacity to 999 (readonly, sent to backend)
watch(isEventCollection, (v) => {
    if (v) maxCapacity.value = 999;
});

// Add mode + isEventCollection: force isActive to false until user saves and edits (then they can set it true in edit mode)
watch([() => props.mode, isEventCollection], ([mode, isCol]) => {
    if (mode === 'add' && isCol) isActive.value = false;
});

// Cover media field - stored as MediaEntity in component, but form schema expects ID
const coverMedia = ref<MediaEntity | null>(null);
const coverId = computed(() => coverMedia.value?.id || null);

// Resources for selecting
const resourcesStore = useResourcesStore();
const eventCategories = computed(() => resourcesStore.eventCategories || []);
const eventTargets = computed(() => resourcesStore.eventTargets || []);

// Fetch speakers for multi-select
const { data: speakersListData, status: isLoadingSpeakers } = await useApiFetch<
    Speaker[]
>('/academy/speakers/active', {
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
watch(
    () => props.initialData,
    async (newData) => {
    // Ensure topics is always initialized as empty array if not provided
        if (!newData && props.mode === 'add') {
            topics.value = [];
        }
        if (
            newData
            && (props.mode === 'edit' || (props.mode === 'add' && newData))
        ) {
            // Handle cover media - could be ID string or MediaEntity object
            let coverEntity: MediaEntity | null = null;
            const coverData = (newData as any).cover;
            const coverUrl = (newData as any).coverUrl;

            if (coverData) {
                if (typeof coverData === 'string') {
                    // If it's an ID, fetch the media entity
                    try {
                        const { data, error } = await useApiFetch<MediaEntity>(
                            `/shared/media/${coverData}`,
                            {
                                server: false,
                            },
                        );

                        const fetchedData = (data.value as { data?: MediaEntity } | null)
                            ?.data;

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
                    size:
            typeof coverEntity.size === 'string'
                ? parseInt(coverEntity.size)
                : coverEntity.size || 0,
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
                ? (newData as any).categories
                        .map(
                            (cat: any) =>
                                cat.eventCategory?.id || cat.eventCategoryId || cat.id,
                        )
                        .filter(Boolean)
                : (newData as any).eventCategoryIds
                    || ((newData as any).eventCategoryId
                        ? [(newData as any).eventCategoryId]
                        : []);

            const targetIds = (newData as any).targets
                ? (newData as any).targets
                        .map(
                            (target: any) =>
                                target.eventTarget?.id || target.eventTargetId || target.id,
                        )
                        .filter(Boolean)
                : (newData as any).eventTargetIds
                    || ((newData as any).eventTargetId
                        ? [(newData as any).eventTargetId]
                        : []);

            setValues({
                title: newData.title,
                description: newData.description,
                shortDescription: newData.shortDescription,
                certNote: (newData as any).certNote || undefined,
                topics: Array.isArray((newData as any).topics)
                    ? (newData as any).topics
                    : [],
                note: newData.note || undefined,
                type: (newData.type?.toUpperCase?.() || newData.type) as any,
                eventCategoryIds: categoryIds.length > 0 ? categoryIds : [],
                eventTargetIds: targetIds.length > 0 ? targetIds : [],
                adminId: (newData as any).adminId,
                maxCapacity:
          (newData as any).maxCapacity ?? (newData as any).maxTrainee ?? 1,
                room: (newData as any).conferenceRoom || newData.room || undefined,
                location: newData.location || undefined,
                isActive: newData.isActive,
                forKids: (newData as any).forKids ?? false,
                disableRegistration: (newData as any).disableRegistration ?? false,
                isFull: (newData as any).isFull ?? false,
                cover: coverEntity?.id || null,
                speakers: (newData.speakers || []).map(
                    (speaker: any) => speaker.speakerId || speaker.id,
                ),
                schedules: (newData.schedules || []).map(schedule => ({
                    ...schedule,
                    date: schedule.date
                        ? new Date(schedule.date).toISOString().split('T')[0]
                        : '',
                    startTime: schedule.startTime || '',
                    endTime: schedule.endTime || '',
                    note: schedule.note || '',
                })),
                questions: ((newData as any).questions || []).map((q: any) => ({
                    ...q,
                    hasAnswers: q.hasAnswers ?? q.has_answers ?? false,
                })),
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
    },
    { immediate: true },
);

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

    // When adding a collection event, default isActive to false (inactive until workshops added)
    if (props.mode === 'add' && isEventCollection.value) {
        submitValues.isActive = false;
        submitValues.maxCapacity = 999;
    }
    // When isEventCollection (add or edit), always send maxCapacity 999 (backend may replace with sum of workshops)
    if (isEventCollection.value) {
        submitValues.maxCapacity = 999;
    }

    submitValues.isEventCollection = isEventCollection.value;

    emit('submit', submitValues as EventForm, {
        isEventCollection: isEventCollection.value,
        workshopCount: workshopCount.value,
    });
});

// Schedule management
const addSchedule = () => {
    schedules.value = [
        ...(schedules.value || []),
        {
            date: '',
            startTime: '',
            endTime: '',
            note: '',
        },
    ];
};

const removeSchedule = (index: number) => {
    if (!schedules.value || index < 0 || index >= schedules.value.length) return;
    schedules.value = [
        ...schedules.value.slice(0, index),
        ...schedules.value.slice(index + 1),
    ];
};

// Re-validate schedules when any date/time/note changes so errors clear live
let schedulesValidateTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
    schedules,
    () => {
        if (schedulesValidateTimeout) clearTimeout(schedulesValidateTimeout);
        schedulesValidateTimeout = setTimeout(() => {
            validateField('schedules');
            schedulesValidateTimeout = null;
        }, 150);
    },
    { deep: true },
);

// Step navigation – dynamic based on isEventCollection
const currentStep = ref(0);
const stepDirection = ref(1); // 1 = forward (next), -1 = backward (prev)

const STEP_FIELDS_NORMAL: (keyof EventForm)[][] = [
    [
        'title',
        'description',
        'shortDescription',
        'note',
        'isActive',
        'forKids',
        'disableRegistration',
        'isFull',
    ],
    ['cover'],
    [
        'type',
        'eventCategoryIds',
        'eventTargetIds',
        'maxCapacity',
        'room',
        'location',
    ],
    ['schedules'],
    ['speakers'],
    ['questions'],
    ['topics', 'certNote'],
];

const STEP_FIELDS_COLLECTION: (keyof EventForm)[][] = [
    [
        'title',
        'description',
        'shortDescription',
        'note',
        'isActive',
        'forKids',
        'disableRegistration',
        'isFull',
    ],
    ['cover'],
    [
        'type',
        'eventCategoryIds',
        'eventTargetIds',
        'maxCapacity',
        'room',
        'location',
    ],
    ['schedules'],
    [], // step 4 = workshops (edit only; validated by count 0 or ≥2)
];

// Collection + add: 4 steps (no Workshops until event is saved). Collection + edit: 5 steps.
const STEP_FIELDS_COLLECTION_ADD: (keyof EventForm)[][]
    = STEP_FIELDS_COLLECTION.slice(0, 4);

const stepLabels = computed(() => {
    if (isEventCollection.value && props.mode === 'edit') {
        return [
            { id: 0, label: t('event.form.steps.details') },
            { id: 1, label: t('event.form.steps.cover_image') },
            { id: 2, label: t('event.form.steps.participant_info') },
            { id: 3, label: t('event.form.steps.date_time_management') },
            { id: 4, label: t('event.form.steps.workshops') },
        ];
    }
    if (isEventCollection.value && props.mode === 'add') {
        return [
            { id: 0, label: t('event.form.steps.details') },
            { id: 1, label: t('event.form.steps.cover_image') },
            { id: 2, label: t('event.form.steps.participant_info') },
            { id: 3, label: t('event.form.steps.date_time_management') },
        ];
    }
    return [
        { id: 0, label: t('event.form.steps.details') },
        { id: 1, label: t('event.form.steps.cover_image') },
        { id: 2, label: t('event.form.steps.participant_info') },
        { id: 3, label: t('event.form.steps.date_time_management') },
        { id: 4, label: t('event.form.steps.speakers') },
        { id: 5, label: t('event.form.steps.questions') },
        { id: 6, label: t('event.form.steps.certificate_content') },
    ];
});

const TOTAL_STEPS = computed(() => stepLabels.value.length);

const STEP_FIELDS = computed(() => {
    if (isEventCollection.value && props.mode === 'edit')
        return STEP_FIELDS_COLLECTION;
    if (isEventCollection.value && props.mode === 'add')
        return STEP_FIELDS_COLLECTION_ADD;
    return STEP_FIELDS_NORMAL;
});

// Step slugs for URL sync (same order as stepLabels)
const stepSlugs = computed(() => {
    if (isEventCollection.value && props.mode === 'edit') {
        return ['details', 'cover', 'participant-info', 'date-time', 'workshops'];
    }
    if (isEventCollection.value && props.mode === 'add') {
        return ['details', 'cover', 'participant-info', 'date-time'];
    }
    return [
        'details',
        'cover',
        'participant-info',
        'date-time',
        'speakers',
        'questions',
        'certificate',
    ];
});

// Sync initialStep from parent (URL) and clamp when TOTAL_STEPS changes
watch(
    () => props.initialStep,
    (v) => {
        if (v !== undefined && v >= 0) {
            const max = TOTAL_STEPS.value - 1;
            currentStep.value = Math.min(Math.max(0, v), max);
        }
    },
    { immediate: true },
);

watch(TOTAL_STEPS, (total) => {
    if (currentStep.value >= total) currentStep.value = Math.max(0, total - 1);
});

// Emit stepChange when currentStep changes so parent can sync URL
watch(
    currentStep,
    (index) => {
        const slug = stepSlugs.value[index];
        if (slug) emit('stepChange', index, slug);
    },
    { immediate: true },
);

/** Validate a single step's fields. Returns true if valid. */
async function validateStep(stepIndex: number): Promise<boolean> {
    const fields = STEP_FIELDS.value[stepIndex];
    if (!fields || fields.length === 0) return true;
    if (stepIndex === 1) {
        setFieldValue('cover', coverId.value);
    }
    for (const name of fields) {
        const result = await validateField(name as string);
        if (!result.valid) return false;
    }
    return true;
}

async function goToNextStep() {
    if (currentStep.value >= TOTAL_STEPS.value - 1) return;
    const ok = await validateStep(currentStep.value);
    if (!ok) return;
    currentStep.value++;
}

/** Called when user clicks a stepper circle. Validate steps when moving forward; allow going back without validation. */
async function onStepperStepClick(requestedIndex: number) {
    if (requestedIndex <= currentStep.value) {
        currentStep.value = requestedIndex;
        return;
    }
    // Moving forward: validate every step from current up to (but not including) requested
    for (let i = currentStep.value; i < requestedIndex; i++) {
        const ok = await validateStep(i);
        if (!ok) return; // stay on current step; errors are already set
    }
    currentStep.value = requestedIndex;
}

watch(currentStep, (next, prev) => {
    stepDirection.value = next > (prev ?? 0) ? 1 : -1;
});

// Subtle slide: short distance (20%) so it feels in-place, not from far away
const slideOffset = computed(() =>
    stepDirection.value === 1
        ? {
                enter: ['10%', 0] as [string | number, number],
                leave: ['-10%', 0] as [string | number, number],
            }
        : {
                enter: ['-10%', 0] as [string | number, number],
                leave: ['10%', 0] as [string | number, number],
            },
);

function onWorkshopCountChange(n: number) {
    workshopCount.value = n;
}

const workshopCountValid = computed(
    () => workshopCount.value === 0 || workshopCount.value >= 2,
);

// Step indices that have validation errors (for stepper error state)
const stepsWithErrors = computed(() => {
    const indices: number[] = [];
    const stepFields = STEP_FIELDS.value;
    stepFields.forEach((fields, index) => {
        const hasError = fields.some(f => errors.value[f]);
        if (hasError) indices.push(index);
    });
    // When collection and event is active, step 4 is invalid if fewer than 2 workshops (no update allowed)
    if (isEventCollection.value && isActive.value && workshopCount.value < 2) {
        if (!indices.includes(4)) indices.push(4);
    }
    return indices;
});

const isSaveDisabled = computed(() => {
    if (props.isSubmitting) return true;
    if (currentStep.value !== TOTAL_STEPS.value - 1) return true;
    if (stepsWithErrors.value.length > 0) return true;
    // When event is active and collection, require at least 2 workshops to allow update
    if (
        isEventCollection.value
        && currentStep.value === 4
        && isActive.value
        && workshopCount.value < 2
    )
        return true;
    return false;
});

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
    <div class="overflow-x-hidden overflow-y-visible">
        <div class="xl:col-span-8 space-y-4 min-w-0 overflow-y-visible">
            <form
                class="space-y-6 overflow-x-hidden overflow-y-visible min-w-0"
                @submit.prevent="onSubmit"
            >
                <EventFormStepper
                    :model-value="currentStep"
                    :steps="stepLabels"
                    :steps-with-errors="stepsWithErrors"
                    @update:model-value="onStepperStepClick"
                />

                <div
                    v-if="showActions"
                    class="flex w-full items-center justify-between gap-2 mx-auto max-w-lg"
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
                            {{ t("common.previous") }}
                        </Button>
                    </div>
                    <div class="min-w-0 flex-1 flex justify-end">
                        <Button
                            v-show="currentStep < TOTAL_STEPS - 1"
                            type="button"
                            variant="outline"
                            @click="goToNextStep"
                        >
                            {{ t("common.next") }}
                            <Icon
                                name="solar:arrow-right-outline"
                                class="ml-2 size-5!"
                            />
                        </Button>
                    </div>
                </div>

                <div class="relative overflow-x-hidden overflow-y-visible min-w-0">
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
                                        class="col-span-12 lg:col-span-9"
                                        :errors="errors.title ? [errors.title] : []"
                                        v-bind="titleAttrs"
                                        required
                                    />
                                    <FormItemSwitch
                                        id="isEventCollection"
                                        v-model="isEventCollection"
                                        :true-label="t('common.yes')"
                                        :false-label="t('common.no')"
                                        :title="t('event.is_event_collection')"
                                        class="col-span-12 lg:col-span-3"
                                        :disabled="forKids || disableRegistration"
                                    />
                                    <FormItemSwitch
                                        id="isActive"
                                        v-model="isActive"
                                        :true-label="t('common.active')"
                                        :false-label="t('common.inactive')"
                                        :title="t('common.active')"
                                        class="col-span-12 lg:col-span-3"
                                        :disabled="mode === 'add' && isEventCollection"
                                        v-bind="isActiveAttrs"
                                    />
                                    <FormItemSwitch
                                        id="forKids"
                                        v-model="forKids"
                                        :true-label="t('common.yes')"
                                        :false-label="t('common.no')"
                                        :title="t('event.for_kids')"
                                        class="col-span-12 lg:col-span-3"
                                        v-bind="forKidsAttrs"
                                    />
                                    <FormItemSwitch
                                        id="disableRegistration"
                                        v-model="disableRegistration"
                                        :true-label="t('common.yes')"
                                        :false-label="t('common.no')"
                                        :title="t('event.disable_registration')"
                                        class="col-span-12 lg:col-span-3"
                                        v-bind="disableRegistrationAttrs"
                                    />
                                    <FormItemSwitch
                                        id="isFull"
                                        v-model="isFull"
                                        :true-label="t('common.yes')"
                                        :false-label="t('common.no')"
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
                                        :errors="
                                            errors.shortDescription ? [errors.shortDescription] : []
                                        "
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
                                            {{ t("form.description") }}
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
                                        :label="t('event.cover')"
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
                                        :placeholder="
                                            t('action.select') + ' ' + t('event_category.singular')
                                        "
                                        class="col-span-12 lg:col-span-4"
                                        :errors="
                                            errors.eventCategoryIds ? [errors.eventCategoryIds] : []
                                        "
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
                                        :placeholder="
                                            t('action.select') + ' ' + t('event_target.singular')
                                        "
                                        class="col-span-12 lg:col-span-4"
                                        :errors="
                                            errors.eventTargetIds ? [errors.eventTargetIds] : []
                                        "
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
                                        :readonly="isEventCollection"
                                        :disabled="isEventCollection"
                                    />
                                    <p
                                        v-if="isEventCollection"
                                        class="col-span-12 text-sm text-muted-foreground"
                                    >
                                        {{ t("event.workshops.max_capacity_from_workshops") }}
                                    </p>
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
                                            {{ t("event.schedules") }}
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
                                                    :errors="
                                                        errors[`schedules.${index}.date`]
                                                            ? [errors[`schedules.${index}.date`]]
                                                            : []
                                                    "
                                                    @update:model-value="
                                                        (value: string | number) =>
                                                            (schedule.date = String(value))
                                                    "
                                                />
                                                <FormItemDatePicker
                                                    :model-value="schedule.startTime"
                                                    :only-time="true"
                                                    :label="t('event.start_time')"
                                                    :placeholder="t('event.start_time')"
                                                    format="HH:mm"
                                                    :name="`schedule-${index}-startTime`"
                                                    class="col-span-12 lg:col-span-4"
                                                    :errors="
                                                        errors[`schedules.${index}.startTime`]
                                                            ? [errors[`schedules.${index}.startTime`]]
                                                            : []
                                                    "
                                                    @update:model-value="
                                                        (value: string | number) =>
                                                            (schedule.startTime = String(value))
                                                    "
                                                />
                                                <FormItemDatePicker
                                                    :model-value="schedule.endTime"
                                                    :only-time="true"
                                                    :label="t('event.end_time')"
                                                    :placeholder="t('event.end_time')"
                                                    format="HH:mm"
                                                    :name="`schedule-${index}-endTime`"
                                                    class="col-span-12 lg:col-span-4"
                                                    :errors="
                                                        errors[`schedules.${index}.endTime`]
                                                            ? [errors[`schedules.${index}.endTime`]]
                                                            : []
                                                    "
                                                    @update:model-value="
                                                        (value: string | number) =>
                                                            (schedule.endTime = String(value))
                                                    "
                                                />
                                                <FormItemInput
                                                    :id="`schedule-${index}-note`"
                                                    v-model="schedule.note"
                                                    :title="t('note.singular')"
                                                    :placeholder="t('note.singular')"
                                                    class="col-span-12"
                                                    :errors="
                                                        errors[`schedules.${index}.note`]
                                                            ? [
                                                                String(
                                                                    errors[`schedules.${index}.note`] || '',
                                                                ),
                                                            ]
                                                            : []
                                                    "
                                                />
                                                <div class="col-span-12">
                                                    <Button
                                                        type="button"
                                                        variant="destructive-outline"
                                                        size="sm"
                                                        class="w-full whitespace-nowrap"
                                                        @click="removeSchedule(Number(index))"
                                                    >
                                                        <Icon
                                                            name="solar:trash-bin-minimalistic-outline"
                                                            class="size-4.5! shrink-0"
                                                        />
                                                        {{ t("action.delete") }}
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
                                                {{ t("action.add") }} {{ t("event.schedule") }}
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

                            <!-- Step 4: Workshops (edit only, when isEventCollection) -->
                            <CompactCard
                                v-else-if="
                                    currentStep === 4
                                        && isEventCollection
                                        && mode === 'edit'
                                        && initialData?.id
                                "
                                icon="solar:widget-5-outline"
                                :title="t('event.form.steps.workshops')"
                            >
                                <EventWorkshopList
                                    :event-id="initialData!.id"
                                    :event-is-active="isActive"
                                    :event-schedules-for-new-workshop="
                                        (schedules || []).map((s: any) => ({
                                            date: s.date || '',
                                            startTime: s.startTime || '',
                                            endTime: s.endTime || '',
                                            note: s.note,
                                        }))
                                    "
                                    @count-change="onWorkshopCountChange"
                                />
                            </CompactCard>

                            <!-- Step 4: Speakers (when not collection) -->
                            <template v-else-if="currentStep === 4 && !isEventCollection">
                                <CompactCard
                                    v-if="isLoadingSpeakers !== 'pending'"
                                    icon="solar:user-speak-rounded-outline"
                                    :title="t('event.form.steps.speakers')"
                                >
                                    <div class="grid grid-cols-12 items-start gap-5">
                                        <LazyFormItemMultiSelect
                                            id="speakers"
                                            v-model="speakers"
                                            :placeholder="
                                                t('action.select') + ' ' + t('academy.speakers')
                                            "
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
                                    :errors="
                                        errors.questions
                                            ? {
                                                questions: Array.isArray(errors.questions)
                                                    ? errors.questions
                                                    : [errors.questions],
                                            }
                                            : {}
                                    "
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
                                        :add-button-text="
                                            t('action.add') + ' ' + (t('event.topic') || 'Topic')
                                        "
                                        item-id-prefix="topic-cert"
                                    />
                                    <FormItemTextarea
                                        id="certNote"
                                        v-model="certNote"
                                        :title="t('event.cert_note') || 'Certificate Note'"
                                        :placeholder="
                                            t('event.cert_note_description')
                                                || 'This content will be shown only in Certificate generation process'
                                        "
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

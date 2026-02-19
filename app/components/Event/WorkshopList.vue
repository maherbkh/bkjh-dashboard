<script setup lang="ts">
import type { Workshop, Speaker } from '~/types';
import type { CreateWorkshopForm } from '~/composables/workshopSchema';
import { toast } from 'vue-sonner';

import { createWorkshopSchema } from '~/composables/workshopSchema';

const { t } = useI18n();
const { show: showAlertDialog } = useAlertDialog();
const props = withDefaults(
    defineProps<{
        eventId: string;
        /** When adding a new workshop, pre-fill schedules with this (from event step 3). Ignored when editing. */
        eventSchedulesForNewWorkshop?: Array<{
            date: string;
            startTime: string;
            endTime: string;
            note?: string;
        }>;
        /** When false, single-workshop state is shown as a warning (not blocking); when true, as error. */
        eventIsActive?: boolean;
    }>(),
    { eventIsActive: true },
);

const emit = defineEmits<{
    countChange: [count: number];
}>();

// List state
const workshops = ref<Workshop[]>([]);
const isLoading = ref(true);
const listError = ref<string | null>(null);

async function fetchWorkshops() {
    if (!props.eventId) return;
    isLoading.value = true;
    listError.value = null;
    try {
        const { data, error } = await useApiFetch<{ data: Workshop[] }>(
            `/academy/events/${props.eventId}/workshops`,
            { server: false },
        );
        if (error.value) {
            listError.value
                = (error.value as any)?.message || t('global.messages.error');
            workshops.value = [];
        }
        else {
            const raw = (data.value as any)?.data;
            workshops.value = Array.isArray(raw) ? raw : [];
        }
    }
    finally {
        isLoading.value = false;
        emit('countChange', workshops.value.length);
    }
}

onMounted(() => fetchWorkshops());
watch(
    () => props.eventId,
    () => fetchWorkshops(),
);

// Form state: null = closed, 'add' = adding new, string = editing workshop id
const formMode = ref<null | 'add' | string>(null);
const formSaving = ref(false);
const formError = ref<string | null>(null);

const defaultForm = (): CreateWorkshopForm => ({
    title: '',
    maxCapacity: 25,
    shortDescription: undefined,
    certNote: undefined,
    topics: [],
    position: workshops.value.length,
    room: undefined,
    location: undefined,
    schedules:
    props.eventSchedulesForNewWorkshop
    && props.eventSchedulesForNewWorkshop.length > 0
        ? props.eventSchedulesForNewWorkshop.map(s => ({
                date: s.date || '',
                startTime: s.startTime || '',
                endTime: s.endTime || '',
                note: s.note ?? undefined,
            }))
        : [],
    speakerIds: [],
});

const form = ref<CreateWorkshopForm>(defaultForm());
const formValidationErrors = ref<Record<string, string>>({});

// Speakers for multi-select
const { data: speakersListData } = await useApiFetch<Speaker[]>(
    '/academy/speakers/active',
    { server: false },
);
const speakersList = computed<Speaker[]>(() => {
    const raw = speakersListData.value as { data?: Speaker[] } | null;
    return raw?.data ?? [];
});

function openAdd() {
    form.value = defaultForm();
    formMode.value = 'add';
    formError.value = null;
    formValidationErrors.value = {};
}

function openEdit(workshop: Workshop) {
    form.value = {
        title: workshop.title,
        maxCapacity: workshop.maxCapacity,
        shortDescription: workshop.shortDescription ?? undefined,
        certNote: workshop.certNote ?? undefined,
        topics: Array.isArray(workshop.topics) ? [...workshop.topics] : [],
        position: workshop.position ?? 0,
        room: workshop.room ?? undefined,
        location: workshop.location ?? undefined,
        schedules: (workshop.schedules || []).map((s) => {
            const dateStr
                = typeof s.date === 'string' ? (s.date.split('T')[0] ?? '') : '';
            return {
                id: s.id,
                date: dateStr,
                startTime: s.startTime ?? '',
                endTime: s.endTime ?? '',
                note: s.note ?? undefined,
            };
        }),
        speakerIds: (workshop.speakers || [])
            .map(sp => sp.speaker?.id)
            .filter(Boolean) as string[],
    };
    formMode.value = workshop.id;
    formError.value = null;
    formValidationErrors.value = {};
}

function closeForm() {
    formMode.value = null;
    formError.value = null;
    formValidationErrors.value = {};
}

// Workshop schedule form helpers
function addSchedule() {
    form.value.schedules = [
        ...(form.value.schedules || []),
        { date: '', startTime: '', endTime: '', note: undefined },
    ];
}

function removeSchedule(index: number) {
    const s = form.value.schedules || [];
    if (index < 0 || index >= s.length) return;
    form.value.schedules = [...s.slice(0, index), ...s.slice(index + 1)];
}

async function submitForm() {
    formError.value = null;
    formValidationErrors.value = {};
    const schema = createWorkshopSchema(t);
    // Only validate and send schedule items that have required fields (allow empty rows in UI)
    const schedulesToValidate = (form.value.schedules || []).filter(
        s => s.date && s.startTime && s.endTime,
    );
    const toValidate = { ...form.value, schedules: schedulesToValidate };
    const parsed = schema.safeParse(toValidate);
    if (!parsed.success) {
        const issues: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
            const path
                = issue.path && issue.path[0] !== undefined ? String(issue.path[0]) : '_';
            if (!issues[path]) issues[path] = issue.message;
        });
        formValidationErrors.value = issues;
        const firstMessage
            = Object.values(issues)[0] || t('global.messages.validation_error');
        toast.error(firstMessage);
        return;
    }
    const payload = parsed.data;
    const validSchedules = (payload.schedules || [])
        .filter(s => s.date && s.startTime && s.endTime)
        .map(({ id: _id, ...s }) => s);
    const body = {
        title: payload.title,
        maxCapacity: payload.maxCapacity,
        ...(payload.shortDescription != null && {
            shortDescription: payload.shortDescription,
        }),
        ...(payload.certNote != null && { certNote: payload.certNote }),
        ...(payload.topics != null
            && payload.topics.length > 0 && { topics: payload.topics }),
        position: payload.position ?? 0,
        ...(payload.room != null && { room: payload.room }),
        ...(payload.location != null && { location: payload.location }),
        ...(validSchedules.length > 0 && { schedules: validSchedules }),
        ...(payload.speakerIds != null
            && payload.speakerIds.length > 0 && { speakerIds: payload.speakerIds }),
    };
    formSaving.value = true;
    try {
        if (formMode.value === 'add') {
            const { error } = await useApiFetch(
                `/academy/events/${props.eventId}/workshops`,
                {
                    method: 'POST',
                    body,
                },
            );
            if (error.value) {
                const errorMessage
                    = (error.value as any)?.data?.message
                        || (error.value as any)?.message
                        || t('global.messages.error');
                formError.value = errorMessage;
                toast.error(errorMessage);
                return;
            }
            toast.success(t('global.messages.success'));
        }
        else if (formMode.value) {
            const { error } = await useApiFetch(
                `/academy/events/${props.eventId}/workshops/${formMode.value}`,
                { method: 'PATCH', body },
            );
            if (error.value) {
                const errorMessage
                    = (error.value as any)?.data?.message
                        || (error.value as any)?.message
                        || t('global.messages.error');
                formError.value = errorMessage;
                toast.error(errorMessage);
                return;
            }
            toast.success(t('global.messages.success'));
        }
        closeForm();
        await fetchWorkshops();
    }
    finally {
        formSaving.value = false;
    }
}

async function confirmDelete(workshop: Workshop) {
    const confirmed = await showAlertDialog({
        title: t('action.delete') + '?',
        description: workshop.title,
    });
    if (!confirmed || !props.eventId) return;
    const { error } = await useApiFetch(
        `/academy/events/${props.eventId}/workshops/${workshop.id}`,
        { method: 'DELETE' },
    );
    if (error.value) return;
    await fetchWorkshops();
}

const workshopCountValid = computed(() => {
    const n = workshops.value.length;
    return n === 0 || n >= 2;
});
</script>

<template>
    <div class="space-y-4">
        <div
            v-if="listError"
            class="text-sm text-destructive"
        >
            {{ listError }}
        </div>
        <div
            v-else-if="isLoading"
            class="flex items-center gap-2 text-muted-foreground"
        >
            <Icon
                name="solar:refresh-outline"
                class="size-5 animate-spin"
            />
            {{ t("common.loading") }}
        </div>
        <template v-else>
            <div class="flex items-center justify-between gap-2">
                <p class="text-sm text-muted-foreground">
                    {{ workshops.length }} {{ t("event.workshops.title").toLowerCase() }}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="openAdd"
                >
                    <Icon
                        name="solar:add-circle-outline"
                        class="mr-2 size-4"
                    />
                    {{ t("event.workshops.add_workshop") }}
                </Button>
            </div>

            <ul
                v-if="workshops.length > 0"
                class="space-y-2"
            >
                <li
                    v-for="w in workshops"
                    :key="w.id"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                    <div>
                        <span class="font-medium">{{ w.title }}</span>
                        <span class="ml-2 text-sm text-muted-foreground">({{ w.maxCapacity }} {{ t("event.max_capacity") }})</span>
                        <span
                            v-if="w.availableSpots != null"
                            class="ml-2 text-xs text-muted-foreground"
                        >
                            {{ t("event.workshops.title") }}: {{ w.availableSpots }}
                            {{ t("event.workshops.free_spots") }}
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            @click="openEdit(w)"
                        >
                            {{ t("action.edit") }}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive-outline"
                            size="sm"
                            @click="confirmDelete(w)"
                        >
                            {{ t("action.delete") }}
                        </Button>
                    </div>
                </li>
            </ul>

            <p
                v-else
                class="text-sm text-muted-foreground"
            >
                {{ t("event.workshops.empty_title") }}
                {{ t("event.workshops.empty_description") }}
            </p>

            <!-- When event is active: require ≥2 workshops (block update). When inactive: show warning for 1 workshop but allow update. -->
            <p
                v-if="eventIsActive && workshops.length < 2"
                class="text-sm text-destructive"
            >
                {{
                    workshops.length === 1
                        ? t("event.workshops.validation_one_workshop")
                        : t("event.workshops.validation_active_need_two")
                }}
            </p>
            <p
                v-else-if="!eventIsActive && workshops.length === 1"
                class="text-sm text-amber-600 dark:text-amber-500"
            >
                {{ t("event.workshops.validation_one_workshop") }}
            </p>

            <!-- Add / Edit form (inline) -->
            <div
                v-if="formMode"
                class="rounded-lg border bg-muted/30 p-4 space-y-4"
            >
                <h4 class="font-medium">
                    {{
                        formMode === "add"
                            ? t("event.workshops.add_workshop")
                            : t("event.workshops.edit_workshop")
                    }}
                </h4>
                <div
                    v-if="formError"
                    class="text-sm text-destructive"
                >
                    {{ formError }}
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <FormItemInput
                        v-model="form.title"
                        :title="t('common.title')"
                        :placeholder="t('common.title')"
                        class="lg:col-span-9 col-span-12"
                        :errors="
                            formValidationErrors.title ? [formValidationErrors.title] : []
                        "
                        required
                    />
                    <FormItemInput
                        :model-value="String(form.maxCapacity)"
                        :title="t('event.max_capacity')"
                        type="number"
                        min="1"
                        max="10000"
                        class="col-span-12 lg:col-span-3"
                        :errors="
                            formValidationErrors.maxCapacity
                                ? [formValidationErrors.maxCapacity]
                                : []
                        "
                        required
                        @update:model-value="(v) => (form.maxCapacity = Number(v) || 0)"
                    />
                    <FormItemTextarea
                        :model-value="form.shortDescription ?? ''"
                        :title="t('common.short_description')"
                        class="col-span-12"
                        :errors="
                            formValidationErrors.shortDescription
                                ? [formValidationErrors.shortDescription]
                                : []
                        "
                        @update:model-value="
                            (v) => (form.shortDescription = v ?? undefined)
                        "
                    />
                    <FormItemInput
                        :model-value="form.room ?? ''"
                        :title="t('event.room')"
                        class="col-span-12 lg:col-span-6"
                        @update:model-value="(v) => (form.room = v ?? undefined)"
                    />
                    <FormItemInput
                        :model-value="form.location ?? ''"
                        :title="t('event.location')"
                        class="col-span-12 lg:col-span-6"
                        @update:model-value="(v) => (form.location = v ?? undefined)"
                    />
                    <FormItemTextarea
                        :model-value="form.certNote ?? ''"
                        :title="t('event.cert_note')"
                        class="col-span-12"
                        :errors="
                            formValidationErrors.certNote
                                ? [formValidationErrors.certNote]
                                : []
                        "
                        @update:model-value="(v) => (form.certNote = v ?? undefined)"
                    />
                    <FormItemArrayInput
                        v-model="form.topics"
                        :title="t('event.topics')"
                        :placeholder="t('event.topic_placeholder')"
                        class="col-span-12"
                        :add-button-text="
                            t('action.add') + ' ' + t('event.topic')
                        "
                        item-id-prefix="workshop-topic"
                    />
                    <div class="col-span-12">
                        <label class="block text-sm font-medium mb-2">{{
                            t("event.schedules")
                        }}</label>
                        <div class="space-y-3">
                            <div
                                v-for="(schedule, idx) in form.schedules || []"
                                :key="idx"
                                class="grid grid-cols-12 gap-2 items-start rounded border p-2 bg-background"
                            >
                                <FormItemDatePicker
                                    :model-value="schedule.date"
                                    :label="t('event.date')"
                                    format="yyyy-MM-dd"
                                    :time-picker="false"
                                    class="col-span-12 lg:col-span-3"
                                    @update:model-value="
                                        (v: string | number) => (schedule.date = String(v))
                                    "
                                />
                                <FormItemDatePicker
                                    :model-value="schedule.startTime"
                                    :only-time="true"
                                    :label="t('event.start_time')"
                                    format="HH:mm"
                                    class="col-span-12 lg:col-span-3"
                                    @update:model-value="
                                        (v: string | number) => (schedule.startTime = String(v))
                                    "
                                />
                                <FormItemDatePicker
                                    :model-value="schedule.endTime"
                                    :only-time="true"
                                    :label="t('event.end_time')"
                                    format="HH:mm"
                                    class="col-span-12 lg:col-span-3"
                                    @update:model-value="
                                        (v: string | number) => (schedule.endTime = String(v))
                                    "
                                />
                                <FormItemInput
                                    :model-value="schedule.note ?? ''"
                                    :title="t('note.singular')"
                                    class="col-span-12 lg:col-span-2"
                                    @update:model-value="(v) => (schedule.note = v ?? undefined)"
                                />
                                <div class="col-span-12 lg:col-span-1 pt-6">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        @click="removeSchedule(idx)"
                                    >
                                        <Icon
                                            name="solar:trash-bin-minimalistic-outline"
                                            class="size-4"
                                        />
                                    </Button>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                @click="addSchedule"
                            >
                                <Icon
                                    name="solar:add-circle-outline"
                                    class="mr-2 size-4"
                                />
                                {{ t("action.add") }} {{ t("event.schedule") }}
                            </Button>
                        </div>
                    </div>
                    <div class="col-span-12">
                        <LazyFormItemMultiSelect
                            v-model="form.speakerIds"
                            :placeholder="t('action.select') + ' ' + t('academy.speakers')"
                            :data="speakersList"
                            item-key="id"
                            item-label="name"
                            class="col-span-12"
                        />
                    </div>
                </div>
                <div class="flex gap-2">
                    <Button
                        type="button"
                        :disabled="formSaving"
                        @click="submitForm"
                    >
                        <Icon
                            v-if="formSaving"
                            name="solar:refresh-outline"
                            class="mr-2 size-4 animate-spin"
                        />
                        {{ formMode === "add" ? t("action.save") : t("action.update") }}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        @click="closeForm"
                    >
                        {{ t("action.cancel") }}
                    </Button>
                </div>
            </div>
        </template>
    </div>
</template>

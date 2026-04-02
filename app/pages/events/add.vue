<script setup lang="ts">
import { toast } from 'vue-sonner';

import type { EventForm } from '~/composables/eventSchema';
import type { EventData } from '~/types';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const STEP_SLUG_TO_INDEX: Record<string, number> = {
    'details': 0,
    'cover': 1,
    'participant-info': 2,
    'date-time': 3,
    'speakers': 4,
    'questions': 5,
    'certificate': 6,
    'workshops': 4,
};
const initialStep = computed(() => {
    const slug = route.query.step as string | undefined;
    if (!slug) return 0;
    const idx = STEP_SLUG_TO_INDEX[slug];
    return idx !== undefined ? idx : 0;
});

function syncStepToUrl(stepIndex: number, slug: string) {
    const next = { path: route.path, query: { ...route.query, step: slug } };
    router.replace(next);
}

const pageTitle = computed(() => t('action.add') + ' ' + t('academy.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.add') + ' ' + t('academy.singular'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

const isSubmitting = ref(false);

const duplicateEventId = computed(() => {
    const raw = route.query.duplicate;
    if (Array.isArray(raw)) {
        const first = raw[0];
        return typeof first === 'string' ? first.trim() : '';
    }
    return typeof raw === 'string' ? raw.trim() : '';
});

const isDuplicating = computed(() => duplicateEventId.value.length > 0);

const duplicateAsyncKey = computed(
    () => `events-add-duplicate:${duplicateEventId.value || 'none'}`,
);

const {
    data: duplicateApiResponse,
    pending: isDuplicatePending,
    error: duplicateFetchError,
    refresh: refreshDuplicateFetch,
} = useAsyncData(
    duplicateAsyncKey,
    () => {
        const id = duplicateEventId.value;
        if (!id) return Promise.resolve(null);
        return fetchDashboardApi<EventData>(`/academy/events/${id}`);
    },
    {
        watch: [duplicateEventId],
        server: false,
        immediate: true,
        default: () => null,
    },
);

const duplicateEventData = computed(() => duplicateApiResponse.value?.data ?? null);

const duplicateLoadFailed = computed(
    () =>
        isDuplicating.value
        && !isDuplicatePending.value
        && (!!duplicateFetchError.value || duplicateEventData.value == null),
);

const onSubmit = async (values: EventForm, options?: { isEventCollection?: boolean }) => {
    isSubmitting.value = true;

    const payload: Record<string, unknown> = {
        ...values,
        topics: Array.isArray(values.topics) ? values.topics : [],
    };

    const { data, error } = await useApiFetch<{ data?: { id: string } }>('/academy/events', {
        method: 'POST',
        body: payload,
    });

    if (error.value) {
        const errorMessage = error.value.data?.message || error.value.message || t('global.messages.something_went_wrong');
        toast.error(errorMessage);
        isSubmitting.value = false;
        return;
    }

    if (data.value) {
        toast.success(t('global.messages.success'));
        const eventId = (data.value as { data?: { id: string } })?.data?.id;
        if (options?.isEventCollection && eventId) {
            await navigateTo(`/events/${eventId}/edit?step=workshops&collection=1`, { replace: true });
        }
        else {
            await navigateTo('/events', { replace: true });
        }
    }

    isSubmitting.value = false;
};

const handleCancel = () => {
    router.back();
};
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:calendar-add-outline'"
        >
            <Button
                variant="outline"
                size="sm"
                @click="handleCancel"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
        </PageHeader>

        <div
            v-if="isDuplicating && isDuplicatePending"
            class="space-y-4 rounded-lg border border-border bg-card p-6"
            role="status"
            :aria-label="$t('event.duplicate_load_loading')"
        >
            <div class="flex items-center gap-3 text-muted-foreground">
                <Icon
                    name="solar:refresh-bold"
                    class="size-6 shrink-0 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                />
                <p class="text-sm font-medium text-foreground">
                    {{ $t('event.duplicate_load_loading') }}
                </p>
            </div>
            <div class="space-y-3">
                <Skeleton class="h-10 w-full max-w-xl" />
                <Skeleton class="h-24 w-full" />
                <Skeleton class="h-10 w-full max-w-md" />
            </div>
        </div>

        <Alert
            v-else-if="duplicateLoadFailed"
            variant="destructive"
            class="border-destructive/50"
        >
            <AlertTitle>{{ $t('event.duplicate_load_failed_title') }}</AlertTitle>
            <AlertDescription class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span>{{ $t('event.duplicate_load_failed_description') }}</span>
                <div class="flex shrink-0 flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        :disabled="isDuplicatePending"
                        @click="refreshDuplicateFetch"
                    >
                        <Icon
                            v-if="isDuplicatePending"
                            name="solar:refresh-bold"
                            class="mr-2 size-4 animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                        />
                        {{ $t('action.retry') }}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        @click="handleCancel"
                    >
                        {{ $t('action.back') }}
                    </Button>
                </div>
            </AlertDescription>
        </Alert>

        <EventForm
            v-else
            mode="add"
            :initial-data="duplicateEventData"
            :initial-step="initialStep"
            :is-submitting="isSubmitting"
            @submit="onSubmit"
            @step-change="syncStepToUrl"
            @cancel="handleCancel"
        />
    </div>
</template>

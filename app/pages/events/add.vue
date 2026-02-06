<script setup lang="ts">
import { toast } from 'vue-sonner';

import type { EventForm } from '~/composables/eventSchema';
import type { EventData } from '~/types';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Step slug <-> index for URL sync
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

// Page configuration
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
// Validation schema is used inside EventForm component; no CRUD here

// State
const isSubmitting = ref(false);

// Duplication logic
const duplicateEventId = computed(() => route.query.duplicate as string);
const isDuplicating = computed(() => !!duplicateEventId.value);

// Reactive data for duplicate event
const duplicateEventData = ref<EventData | null>(null);
const isLoadingDuplicate = ref(false);

// Fetch event data for duplication when ID is available
watch(duplicateEventId, async (id) => {
    if (id) {
        isLoadingDuplicate.value = true;
        try {
            const { data } = await useApiFetch<EventData>(`/academy/events/${id}`, {
                server: false,
            });
            duplicateEventData.value = data.value?.data || null;
        }
        catch (error) {
            console.error('Error fetching event for duplication:', error);
            duplicateEventData.value = null;
        }
        finally {
            isLoadingDuplicate.value = false;
        }
    }
    else {
        duplicateEventData.value = null;
    }
}, { immediate: true });

// Form submission
const onSubmit = async (values: EventForm, options?: { isEventCollection?: boolean }) => {
    isSubmitting.value = true;

    // Ensure topics is always an array, never null or undefined
    const payload: any = {
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
        const eventId = (data.value as any)?.data?.id;
        if (options?.isEventCollection && eventId) {
            await navigateTo(`/events/${eventId}/edit?step=workshops&collection=1`, { replace: true });
        }
        else {
            await navigateTo('/events', { replace: true });
        }
    }

    isSubmitting.value = false;
};

// Cancel handler
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

        <EventForm
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

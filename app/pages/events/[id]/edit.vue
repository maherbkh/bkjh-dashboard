<script setup lang="ts">
import type { EventData } from '~/types';
import { toast } from 'vue-sonner';

import type { EventForm } from '~/composables/eventSchema';

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

// When redirected from add (collection event), treat as collection so workshops step and slug work
const forceEventCollection = computed(() =>
    route.query.collection === '1' || route.query.collection === 'true',
);

function syncStepToUrl(stepIndex: number, slug: string) {
    const next = { path: route.path, query: { ...route.query, step: slug } };
    router.replace(next);
}

// Page configuration
const pageTitle = computed(() => t('action.edit') + ' ' + t('academy.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.edit') + ' ' + t('academy.singular'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// State
const editingEvent = ref<EventData | null>(null);
const isSubmitting = ref(false);

// Load event data
onMounted(async () => {
    const { data, error } = await useApiFetch(`/academy/events/${route.params.id as string}`);
    if (error.value) {
        toast.error(t('global.messages.error'));
        return;
    }
    if (data.value) {
        editingEvent.value = (data.value as any).data as EventData;
        const event = editingEvent.value;
        if (event?.isEventCollection === true && (!event.workshops || event.workshops.length === 0)) {
            router.replace({ path: route.path, query: { ...route.query, step: 'workshops', collection: '1' } });
        }
    }
});

// Form submission
const onSubmit = async (
    values: EventForm,
    options?: { isEventCollection?: boolean; workshopCount?: number },
) => {
    if (!editingEvent.value) return;
    isSubmitting.value = true;

    // Ensure topics is always an array, never null or undefined
    const payload: any = {
        ...values,
        topics: Array.isArray(values.topics) ? values.topics : [],
    };

    console.log('API Payload topics:', payload.topics); // Debug log

    const { data, error } = await useApiFetch(`/academy/events/${editingEvent.value.id}`, {
        method: 'PATCH',
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
        const isCol = options?.isEventCollection === true;
        const count = options?.workshopCount ?? 0;
        if (isCol && count < 2) {
            await navigateTo(`/events/${route.params.id as string}/edit?step=workshops&collection=1`, { replace: true });
        }
        else {
            await navigateTo(`/events/${route.params.id as string}/show`, { replace: true });
        }
    }

    isSubmitting.value = false;
};

// Cancel handler
const handleCancel = () => {
    navigateTo(`/events/${route.params.id as string}`);
};
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:pen-outline'"
        >
            <NuxtLink :to="`/events/${route.params.id as string}`">
                <Button
                    variant="outline"
                    size="sm"
                >
                    <Icon name="solar:arrow-left-outline" />
                    {{ $t('action.back') }}
                </Button>
            </NuxtLink>
        </PageHeader>

        <EventForm
            mode="edit"
            :initial-data="editingEvent"
            :initial-step="initialStep"
            :force-event-collection="forceEventCollection"
            :is-submitting="isSubmitting"
            @submit="onSubmit"
            @step-change="syncStepToUrl"
        />
    </div>
</template>

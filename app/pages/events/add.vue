<script setup lang="ts">
import { toast } from 'vue-sonner';

import type { EventForm } from '~/composables/eventSchema';
import type { EventData } from '~/types';

const { t } = useI18n();
const route = useRoute();

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
const router = useRouter();

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
const onSubmit = async (values: EventForm) => {
    isSubmitting.value = true;

    // Ensure topics is always an array, never null or undefined
    const payload: any = {
        ...values,
        topics: Array.isArray(values.topics) ? values.topics : [],
    };

    console.log('API Payload topics:', payload.topics); // Debug log

    const { data, error } = await useApiFetch('/academy/events', {
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
        await navigateTo('/events');
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
            :is-submitting="isSubmitting"
            @submit="onSubmit"
            @cancel="handleCancel"
        />
    </div>
</template>

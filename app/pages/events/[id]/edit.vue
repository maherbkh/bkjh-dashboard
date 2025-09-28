<script setup lang="ts">
import type { EventData } from '~/types';
import { toast } from 'vue-sonner';

import type { EventForm } from '~/composables/eventSchema';

const { t } = useI18n();
const route = useRoute();// Page configuration
const pageTitle = computed(() => t('action.edit') + ' ' + t('event.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.edit') + ' ' + t('event.singular'));

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
    }
});

// Form submission
const onSubmit = async (values: EventForm) => {
    if (!editingEvent.value) return;
    isSubmitting.value = true;
    const { data, error } = await useApiFetch(`/academy/events/${editingEvent.value.id}`, {
        method: 'PATCH',
        body: values as any,
    });

    if (error.value) {
        const errorMessage = error.value.data?.message || error.value.message || t('global.messages.something_went_wrong');
        toast.error(errorMessage);
        isSubmitting.value = false;
        return;
    }

    if (data.value) {
        toast.success(t('global.messages.success'));
        await navigateTo(`/events/${route.params.id as string}/show`, { replace: true });
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
            :is-submitting="isSubmitting"
            @submit="onSubmit"
        />
    </div>
</template>

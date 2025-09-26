<script setup lang="ts">
import { toast } from 'vue-sonner';

import type { EventForm } from '~/composables/eventSchema';

const { t } = useI18n();
// Page configuration
const pageTitle = computed(() => t('action.add') + ' ' + t('event.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.add') + ' ' + t('event.singular'));

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

// Form submission
const onSubmit = async (values: EventForm) => {
    isSubmitting.value = true;

    const { data, error } = await useApiFetch('/academy/events', {
        method: 'POST',
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
            :is-submitting="isSubmitting"
            @submit="onSubmit"
            @cancel="handleCancel"
        />
    </div>
</template>

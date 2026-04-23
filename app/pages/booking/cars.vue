<script setup lang="ts">
const { t } = useI18n();
const pageIcon = usePageIcon();

const pageTitle = computed(() => t('booking.cars_booking.title'));
const pageDescription = computed(() => t('booking.cars_booking.description'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'mingcute:car-3-line'"
            :has-add-new="false"
            :has-deleted-items="false"
        />

        <div class="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
            {{ $t('booking.cars_booking.empty_state') }}
        </div>
    </div>
</template>

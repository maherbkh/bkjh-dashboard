<script setup lang="ts">
import type { EventData } from '~/types';
import { computed } from 'vue';

const route = useRoute();
const { addOpenedEvent } = useOpenedEvents();
definePageMeta({
    middleware: 'auth',
});

interface EventResponse { success: boolean; message?: string; data: EventData }

const { data, status, refresh } = useApiFetch<EventResponse>(`/api/v1/dashboard/academy/events/${route.params.id as string}`, {
    immediate: false,
});
const eventData = computed<EventData | undefined>(() => (data.value as any)?.data as EventData | undefined);
// Watch for data changes and store event when available
watch(eventData, (ev) => {
    if (ev?.id && ev?.title) addOpenedEvent(ev.id, ev.title);
}, { immediate: true });

onMounted(async () => {
    await refresh();
});

const eventTitle = computed(() => eventData.value?.title || '');

useSeoMeta({
    title: eventTitle,
    ogTitle: eventTitle,
});
</script>

<template>
    <div class="flex flex-col gap-6">
        <Event
            v-if="eventData && status !== 'pending'"
            :event="eventData as EventData"
        />
    </div>
</template>

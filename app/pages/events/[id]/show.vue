<script setup lang="ts">
const route = useRoute();
const { addOpenedEvent } = useOpenedEvents();

definePageMeta({
    middleware: 'auth',
});

const { data, status, error } = useApiFetch(`/api/v1/dashboard/academy/events/${route.params.id as string}`);

// Watch for data changes and store event when available
watch(data, (newData) => {
    if (newData?.data) {
        const ev = newData.data;
        if (ev?.id && ev?.title) {
            addOpenedEvent(ev.id, ev.title);
        }
    }
}, { immediate: true });
</script>

<template>
    <div class="flex flex-col gap-6">
        <Event
            v-if="data && data.data && status !== 'pending'"
            :event="data.data as EventData"
        />
    </div>
</template>

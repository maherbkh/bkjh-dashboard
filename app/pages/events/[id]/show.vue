<script setup lang="ts">
const route = useRoute();

definePageMeta({
    middleware: 'auth',
});

const { data, status, error } = useApiFetch<EventData>(`/api/v1/dashboard/academy/events/${route.params.id as string}`);
</script>

<template>
    <div class="flex flex-col gap-6">
        <Event
            v-if="status !== 'pending'"
            :event="data.data"
        />
    </div>
</template>

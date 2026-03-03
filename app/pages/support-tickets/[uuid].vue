<script setup lang="ts">
const route = useRoute();
definePageMeta({
    middleware: 'auth',
});
// Get ID from route params
const id = computed(() => route.params.uuid as string);
</script>

<template>
    <div class="flex flex-col gap-6">
        <Ticket :id="id" />
    </div>
</template>

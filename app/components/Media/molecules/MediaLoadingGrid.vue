<template>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MediaSkeleton
            v-for="i in count"
            :key="i"
            variant="card"
            class="aspect-square"
        />
    </div>
</template>

<script setup lang="ts">
interface Props {
    count?: number;
}

withDefaults(defineProps<Props>(), {
    count: 12,
});
</script>

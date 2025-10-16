<template>
    <div class="space-y-3">
        <MediaSkeleton
            v-for="i in count"
            :key="i"
            variant="list"
        />
    </div>
</template>

<script setup lang="ts">
interface Props {
    count?: number;
}

withDefaults(defineProps<Props>(), {
    count: 8,
});
</script>

<script setup lang="ts">
defineProps<{
    title: any;
    value: any;
}>();
</script>

<template>
    <div class="flex items-start gap-4 md:flex-row flex-col justify-between first:pt-0 last:pb-0 py-1.5">
        <div class="font-normal text-muted-foreground">
            {{ title }}
        </div>
        <div class="font-normal font-mono">
            <span v-if="value">{{ value }}</span>
            <span
                v-else
                class="text-muted-foreground font-normal italic text-xs"
            >{{ $t('common.not_assigned') }}</span>
        </div>
    </div>
</template>

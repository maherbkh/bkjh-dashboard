<script setup lang="ts">
defineProps<{
    title: any;
    value: any;
}>();
</script>

<template>
    <div class="flex items-start gap-4 md:flex-row flex-col justify-between first:pt-0 last:pb-0 py-1.5">
        <div class="font-medium text-muted-foreground">
            {{ title }}
        </div>
        <div class="font-light font-mono">
            <span v-if="value">{{ value }}</span>
            <span
                v-else
                class="text-muted-foreground font-light italic text-xs"
            >{{ $t('global.common.not_assigned') }}</span>
        </div>
    </div>
</template>

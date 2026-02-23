<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <div
        data-slot="dialog-footer"
        :class="cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border px-4 pt-4 pb-4', props.class)"
    >
        <slot />
    </div>
</template>

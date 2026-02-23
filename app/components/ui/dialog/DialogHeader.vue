<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <div
        data-slot="dialog-header"
        :class="cn('flex flex-col gap-2 text-center sm:text-left border-b border-border px-4 pt-4 pb-4', props.class)"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <h3
        data-slot="card-title"
        :class="cn('leading-none font-medium text-sm flex items-center gap-2', props.class)"
    >
        <slot />
    </h3>
</template>

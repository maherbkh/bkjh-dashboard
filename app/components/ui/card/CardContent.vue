<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <div
        data-slot="card-content"
        :class="cn('px-4 font-light text-sm mt-3', props.class)"
    >
        <slot />
    </div>
</template>

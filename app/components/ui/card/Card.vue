<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <div
        data-slot="card"
        :class="
            cn(
                'bg-card/40 text-card-foreground flex flex-col rounded-xl border py-4',
                props.class,
            )
        "
    >
        <slot />
    </div>
</template>

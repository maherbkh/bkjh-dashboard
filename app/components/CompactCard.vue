<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
    defineProps<{
        icon: string;
        title: string;
        description?: string;
        class?: HTMLAttributes['class'];
        contentClass?: HTMLAttributes['class'];
    }>(),
    { description: '' },
);
</script>

<template>
    <div
        data-slot="compact-card"
        :class="cn('border-y-2 border-border/50 border-dashed bg-card py-4', props.class)"
    >
        <div class="flex items-start gap-2 px-4 pb-2">
            <Icon
                :name="icon"
                class="size-5! shrink-0 opacity-75 text-muted-foreground"
            />
            <div class="min-w-0 flex-1 space-y-0.5">
                <h3 class="text-base font-medium text-foreground">
                    {{ title }}
                </h3>
                <p
                    v-if="description"
                    class="text-sm text-muted-foreground"
                >
                    {{ description }}
                </p>
            </div>
        </div>
        <div
            v-if="$slots.default"
            :class="cn('mt-2 border border-border pt-2 bg-muted/50 rounded-lg px-4 py-4 mx-4 mb-4 *:ease-in-out duration-200', props.contentClass)"
        >
            <slot />
        </div>
    </div>
</template>

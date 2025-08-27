<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useSidebar } from './utils';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();

const { toggleSidebar } = useSidebar();
</script>

<template>
    <Button
        data-sidebar="trigger"
        data-slot="sidebar-trigger"
        variant="ghost"
        size="icon"
        :class="cn('size-7 p-1 cursor-pointer', props.class)"
        @click="toggleSidebar"
    >
        <Icon
            name="solar:list-bold"
            class="!size-6 shrink-0"
        />
        <span class="sr-only">{{ $t('global.toggle_sidebar') }}</span>
    </Button>
</template>

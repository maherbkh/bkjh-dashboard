<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui';
import type { CollapsibleContentProps } from 'reka-ui';

const props = defineProps<CollapsibleContentProps>();
</script>

<template>
    <CollapsibleContent
        class="pt-1"
        data-slot="collapsible-content"
        v-bind="props"
    >
        <slot />
    </CollapsibleContent>
</template>

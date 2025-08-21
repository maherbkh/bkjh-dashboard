<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

const { t } = useI18n();

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <nav
        :aria-label="t('global.navigation.breadcrumb')"
        data-slot="breadcrumb"
        :class="props.class"
    >
        <slot />
    </nav>
</template>

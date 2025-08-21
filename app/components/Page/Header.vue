<script setup lang="ts">
// Using Nuxt 3 auto-imports for composables and components
const { t } = useI18n();

const props = withDefaults(defineProps<{
    title?: string;
    icon?: string;
}>(), {
    title: '',
    icon: 'solar:bookmark-linear',
});

const displayTitle = computed(() => props.title || t('page.page_title'));
</script>

<template>
    <div class="flex md:flex-row flex-col gap-2 items-start justify-between">
        <div class="flex items-center gap-2">
            <Icon
                class="!size-5"
                :name="icon"
            />
            <div class="font-medium">
                {{ displayTitle }}
            </div>
        </div>
        <div class="flex md:flex-row flex-col gap-4">
            <slot />
        </div>
    </div>
</template>

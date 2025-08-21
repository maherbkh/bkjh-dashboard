<script setup lang="ts">
const { t } = useI18n();
const colorMode = useColorMode();

const props = withDefaults(
    defineProps<{
        variant?: 'dark' | 'light' | 'auto';
    }>(),
    {
        variant: 'auto',
    },
);

const logoSrc = computed(() => {
    if (props.variant === 'auto') {
        return colorMode.value === 'dark' ? '/logo_dark.svg' : '/logo.svg';
    }
    return props.variant === 'light' ? '/logo.svg' : '/logo_dark.svg';
});
</script>

<template>
    <NuxtImg
        alt="Logo"
        :title="t('global.app_name')"
        :src="logoSrc"
    />
</template>

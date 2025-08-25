<template>
    <div>
        {{ $t('page.home') }}
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Set page title with translation
useHead({
    title: t('global.navigation.dashboard')
})

definePageMeta({
    middleware: 'auth',
})
</script>

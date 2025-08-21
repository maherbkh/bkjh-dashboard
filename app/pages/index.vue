<template>
    <div>
        {{ $t('page.home') }}
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth',
})
</script>

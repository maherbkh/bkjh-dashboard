<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
            <h1 class="text-h1">
                {{ $t('auth.welcome_back') }}, {{ userStore.user?.firstName || userStore.user?.name || 'User' }}
            </h1>
        </div>
        <!--    <DashboardTicketingOverview v-if="appStore.isSupport" /> -->
        <DashboardAcademy v-if="appStore.isAcademy" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import { useAppStore } from '~/stores/app';

const { t } = useI18n();
const userStore = useUserStore();
const appStore = useAppStore();

// Set page title with translation
useHead({
    title: t('global.dashboard'),
});

definePageMeta({
    middleware: 'auth',
});
</script>

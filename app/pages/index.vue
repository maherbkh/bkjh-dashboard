<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
            <h1 class="text-h1">
                {{ $t('auth.welcome_back') }}, {{ userStore.user?.firstName || userStore.user?.name || 'User' }}
            </h1>
        </div>
        <!--    <DashboardTicketingOverview v-if="isSupport" /> -->
        <DashboardAcademy v-if="isAcademy" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const { t } = useI18n();
const userStore = useUserStore();
const { isSupport, isAcademy } = useApp();

// Set page title with translation
useHead({
    title: t('global.dashboard'),
});

definePageMeta({
    middleware: 'auth',
});
</script>

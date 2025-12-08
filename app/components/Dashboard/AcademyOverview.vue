<template>
    <div class="flex flex-col gap-6">
        <!-- Header Section -->
        <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold tracking-tight">
                {{ $t('auth.welcome_back') }}, {{ userStore.user?.firstName || userStore.user?.name || 'User' }}
            </h1>
            <p class="text-muted-foreground">
                {{ $t('academy.plural') }} {{ $t('global.dashboard') }} - {{ $t('global.overview') }}
            </p>
        </div>

        <div>
            <div>Dashboard Stats</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const { t } = useI18n();
const userStore = useUserStore();
</script>

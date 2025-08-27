<template>
    <DashboardTicketingOverview v-if="appStore.isSupport" />
    <DashboardAcademyOverview v-else-if="appStore.isAcademy" />
    <div v-else class="flex flex-col gap-6">
        <!-- Fallback for unknown app type -->
        <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold tracking-tight">
                {{ $t('auth.welcome_back') }}, {{ userStore.user?.firstName || userStore.user?.name || 'User' }}
            </h1>
            <p class="text-muted-foreground">
                {{ $t('global.dashboard') }} - {{ $t('global.overview') }}
            </p>
        </div>
        
        <Card>
            <CardContent class="flex flex-col items-center justify-center py-12">
                <Icon name="solar:question-circle-outline" class="h-12 w-12 text-muted-foreground mb-4" />
                <h3 class="text-lg font-semibold mb-2">{{ $t('common.app_not_found') }}</h3>
                <p class="text-muted-foreground text-center">
                    {{ $t('common.please_select_app') }}
                </p>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useAppStore } from '~/stores/app'

const { t } = useI18n()
const userStore = useUserStore()
const appStore = useAppStore()

// Set page title with translation
useHead({
    title: t('global.dashboard')
})

definePageMeta({
    middleware: 'auth',
})
</script>

<script setup lang="ts">
definePageMeta({
    layout: false,
    middleware: 'guest',
})

const { t } = useI18n()

// Make SEO meta reactive to language changes
watchEffect(() => {
    useSeoMeta({
        title: t('auth.reset_password_title'),
        ogTitle: t('auth.reset_password_title'),
    })
})
</script>

<template>
    <div
        class="relative flex flex-col items-center justify-center px-4 h-dvh lg:max-w-none lg:px-0"
        :class="{ 'flex-row-reverse': false }"
    >
        <div class="mx-auto flex-1 lg:p-8">
            <div class="grid mx-auto max-w-sm gap-6">
                <div class="grid gap-2 text-center">
                    <h1 class="text-2xl font-semibold tracking-tight">
                        {{ $t('auth.reset_password_title') }}
                    </h1>
                    <p class="text-balance text-sm text-muted-foreground">
                        {{ $t('auth.reset_password_description') }}
                    </p>
                </div>
                <AuthResetPassword />
            </div>
            <div class="mt-8 place-content-center flex items-center gap-5">
                <ColorModeSwitcher />
                <AppLangSelector />
            </div>
        </div>
    </div>
</template>

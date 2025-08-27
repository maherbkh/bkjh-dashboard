<script setup lang="ts">
definePageMeta({
    layout: false,
    middleware: 'guest',
})

const { t } = useI18n()

// Make SEO meta reactive to language changes
watchEffect(() => {
    useSeoMeta({
        title: t('auth.login'),
        ogTitle: t('auth.login'),
    })
})
</script>

<template>
    <div
        class="relative flex items-center justify-center px-4 h-dvh lg:max-w-none lg:px-0"
        :class="{ 'flex-row-reverse': true }"
    >
        <div class="relative hidden h-full flex-1 flex-col bg-[url(/images/login-bg.jpg)] bg-blend-screen bg-muted bg-cover bg-right p-10 text-white lg:flex dark:border-r">
            <div class="absolute inset-0 from-primary to-transparent bg-gradient-to-b" />
            <div class="relative z-20 flex items-center text-lg font-medium">
                <AppLogo
                    variant="light"
                    class="h-20"
                />
            </div>
        </div>
        <div class="mx-auto flex-1 lg:p-8">
            <div class="grid mx-auto max-w-sm gap-6">
                <div class="grid gap-2 text-center">
                    <h1 class="text-2xl font-semibold tracking-tight">
                        {{ $t('auth.welcome_back') }}
                    </h1>
                    <p class="text-balance text-sm text-muted-foreground">
                        {{ $t('auth.description') }}
                    </p>
                </div>
                <AuthSignIn />
            </div>
            <div class="mt-8 place-content-center flex items-center gap-5">
                <ColorModeSwitcher />
                <AppLangSelector />
            </div>
        </div>
    </div>
</template>

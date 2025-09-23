<script setup lang="ts">
const { t } = useI18n();
const router = useRouter();

// Page configuration
const pageTitle = computed(() => t('task.plural'));
const pageIcon = 'solar:clipboard-list-outline';
const pageDescription = computed(() => t('task.plural'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});
</script>

<template>
    <div>
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon"
        >
            <Button
                variant="outline"
                size="sm"
                @click="router.back()"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
        </PageHeader>

        <!-- Tasks content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Tasks Content
        </div>
    </div>
</template>

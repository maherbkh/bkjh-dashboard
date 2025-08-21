<template>
    <div>
        <Suspense>
            <template #default>
                <PermissionTable v-bind="$attrs" />
            </template>
            <template #fallback>
                <div class="flex items-center justify-center py-8">
                    <div class="flex items-center space-x-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        <span class="text-sm text-muted-foreground">{{ $t('global.loading') }}</span>
                    </div>
                </div>
            </template>
        </Suspense>
    </div>
</template>

<script setup lang="ts">
// Lazy load the PermissionTable component
const PermissionTable = defineAsyncComponent(() =>
    import('./Table.vue'),
);
</script>

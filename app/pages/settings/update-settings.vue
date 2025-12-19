<template>
    <div class="flex flex-col gap-6">
        <div class="flex md:flex-row flex-col  justify-between gap-2">
            <h1 class="text-h1">
                Update Settings
            </h1>
            <div class="flex flex-col gap-2">
                <div class="flex flex-wrap gap-2">
                    <Button
                        v-for="app in apps"
                        :key="app"
                        :variant="selectedApp === app ? 'default' : 'outline'"
                        size="sm"
                        @click="selectApp(app)"
                    >
                        {{ app }}
                    </Button>
                </div>
            </div>
        </div>

        <div
            v-if="status === 'pending'"
            class="flex items-center justify-center p-8"
        >
            <div class="text-muted-foreground">
                Loading...
            </div>
        </div>
        <div
            v-else
            class="flex flex-col gap-4"
        >
            <div class="grid grid-cols-12 gap-4 items-start">
                <div class="sticky top-4  lg:col-span-3 md:col-span-4 col-span-12 self-start">
                    <nav class="flex flex-col gap-1 p-2 bg-accent rounded-lg text-left">
                        <div
                            v-for="section in data"
                            :key="section.id"
                            :class="[
                                'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer',
                                selectedSection === section.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-background',
                            ]"
                            @click="selectedSection = section.id"
                        >
                            <Icon
                                name="solar:widget-outline"
                                :class="[
                                    '!size-4 shrink-0',
                                    selectedSection === section.id ? 'opacity-100' : 'opacity-75',
                                ]"
                            />
                            <span class="text-sm">{{ section.name }}</span>
                        </div>
                    </nav>
                </div>
                <div class="lg:col-span-9 md:col-span-8 col-span-12">
                    <pre
                        v-if="selectedSectionData"
                        class="text-sm"
                    >{{ JSON.stringify(selectedSectionData.children, null, 2) }}</pre>
                    <div
                        v-else
                        class="text-muted-foreground text-sm"
                    >
                        Select a section to view details
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

// Set page title
useHead({
    title: 'Update Settings',
});

definePageMeta({
    middleware: 'auth',
});
const apps = ref<string[]>(['SHARED', 'DASHBOARD', 'SUPPORT', 'ACADEMY']);

const selectedApp = ref<string>('SHARED');
const selectedSection = ref<string | null>(null);

// Fetch data from API
const { data, error, status, refresh } = await useApiFetch('/shared/settings-actions/sections', {
    method: 'GET',
    transform: data => data.data,
    query: {
        apps: selectedApp.value,
    },
});

// Select app
const selectApp = async (app: string) => {
    selectedApp.value = app;
    // Reset to first section when app changes
    selectedSection.value = null;
    // Refresh data when selected app changes
    await refresh();
};

// Get the selected section object
const selectedSectionData = computed(() => {
    if (!selectedSection.value || !data.value) return null;
    return data.value.find(section => section.id === selectedSection.value);
});

// Set section at index 0 as selected when data loads or changes
watch(data, (newData) => {
    if (newData && newData.length > 0) {
        selectedSection.value = newData[0].id;
    }
}, { immediate: true });
</script>

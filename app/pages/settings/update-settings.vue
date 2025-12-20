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
                    <nav class="flex flex-col gap-1 p-2 bg-accent/50 rounded-lg text-left">
                        <div
                            v-for="section in data"
                            :key="section.id"
                            :class="[
                                'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer',
                                selectedSection === section.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-background',
                            ]"
                            @click="selectSection(section.id)"
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
                    <SettingsForm
                        v-if="selectedSectionData && selectedSectionData.children && selectedSectionData.children.length > 0"
                        ref="settingsFormRef"
                        :key="`settings-${selectedSection}-${selectedSectionData.children.length}`"
                        :settings="selectedSectionData.children"
                        :emit-mode="'both'"
                        @update:settings="handleSettingsUpdate"
                        @change="handleSettingChange"
                        @submit="(settings) => handleSettingsSubmit(settings)"
                    />
                    <div
                        v-if="selectedSectionData && selectedSectionData.children && selectedSectionData.children.length > 0"
                        class="w-full mt-4"
                    >
                        <Button
                            class="w-full"
                            @click="handleSubmitClick"
                        >
                            {{ $t('action.save') || 'Save' }}
                        </Button>
                    </div>
                    <div
                        v-else-if="selectedSectionData && (!selectedSectionData.children || selectedSectionData.children.length === 0)"
                        class="text-center py-12"
                    >
                        <Icon
                            name="solar:settings-outline"
                            class="!size-12 mx-auto mb-4 text-muted-foreground opacity-50"
                        />
                        <p class="text-muted-foreground text-sm">
                            No settings available in this section
                        </p>
                    </div>
                    <div
                        v-else
                        class="text-center py-12"
                    >
                        <Icon
                            name="solar:widget-outline"
                            class="!size-12 mx-auto mb-4 text-muted-foreground opacity-50"
                        />
                        <p class="text-muted-foreground text-sm">
                            Select a section to view details
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Setting } from '~/types';
import { SettingValueType } from '~/types/settings';
import SettingsForm from '~/components/Settings/Form/index.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Set page title
useHead({
    title: 'Update Settings',
});

definePageMeta({
    middleware: 'auth',
});
const apps = ref<string[]>(['SHARED', 'DASHBOARD', 'SUPPORT', 'ACADEMY', 'SIGNATURE']);

// Initialize from URL params or defaults
const selectedApp = ref<string>((route.query.app as string) || 'SHARED');
const selectedSection = ref<string | null>((route.query.section as string) || null);

// Ref to access SettingsForm component
const settingsFormRef = ref<InstanceType<typeof SettingsForm> | null>(null);

// Update URL query params
const updateUrlParams = () => {
    router.replace({
        query: {
            ...route.query,
            app: selectedApp.value,
            ...(selectedSection.value ? { section: selectedSection.value } : {}),
        },
    });
};

// Fetch data from API (no caching - always fresh)
const queryParams = reactive({
    apps: selectedApp.value,
});

// Create a reactive cache key with timestamp for cache busting
const cacheKey = ref(`settings-sections-${selectedApp.value}-${Date.now()}`);

const { data, error, status, refresh: originalRefresh } = await useApiFetch('/shared/settings-actions/sections', {
    method: 'GET',
    transform: data => data.data,
    query: queryParams,
    key: cacheKey.value,
});

// Override refresh to update cache busting timestamp (client-side only)
const refresh = async () => {
    cacheKey.value = `settings-sections-${selectedApp.value}-${Date.now()}`;
    await originalRefresh();
};

// Select app
const selectApp = async (app: string) => {
    selectedApp.value = app;
    queryParams.apps = app;
    cacheKey.value = `settings-sections-${app}-${Date.now()}`; // Update cache key
    // Reset to first section when app changes
    selectedSection.value = null;
    updateUrlParams();
    // Refresh data when selected app changes
    await originalRefresh();
};

// Select section
const selectSection = (sectionId: string) => {
    selectedSection.value = sectionId;
    updateUrlParams();
};

// Get the selected section object
const selectedSectionData = computed(() => {
    if (!selectedSection.value || !data.value) return null;
    return data.value.find(section => section.id === selectedSection.value);
});

// Set section at index 0 as selected when data loads or changes (only if no section in URL)
watch(data, (newData) => {
    if (newData && newData.length > 0) {
        // If no section is selected (from URL or otherwise), select the first one
        if (!selectedSection.value) {
            selectedSection.value = newData[0].id;
            updateUrlParams();
        }
        // If section from URL doesn't exist in new data, select first one
        else if (!newData.find(section => section.id === selectedSection.value)) {
            selectedSection.value = newData[0].id;
            updateUrlParams();
        }
    }
}, { immediate: true });

// Handle settings update - keep parent state in sync with form
const handleSettingsUpdate = (updatedSettings: Setting[]) => {
    if (!selectedSectionData.value) return;

    // Update the selected section's children with the latest values
    selectedSectionData.value.children = updatedSettings.map(setting => ({ ...setting }));
};

// Handle individual setting change
const handleSettingChange = (setting: any, index: number) => {
    console.log('Setting changed:', setting, 'at index:', index);
    // Handle individual change if needed
};

// Transform settings to API format
const transformSettingsForAPI = (settings: Setting[]) => {
    return settings.map((setting) => {
        let value: any = setting.value;

        // Handle UPLOADER type - send full object with alt, title, mediaId, collection
        if (setting.type === SettingValueType.UPLOADER) {
            if (value && typeof value === 'object' && value !== null) {
                // Ensure we have the full object structure
                value = {
                    alt: value.alt || '',
                    title: value.title || '',
                    mediaId: value.mediaId || value.id || null,
                    collection: value.collection || 'default',
                };
            }
            else if (typeof value === 'string' && value) {
                // If it's a string (mediaId), convert to object format
                value = {
                    alt: '',
                    title: '',
                    mediaId: value,
                    collection: 'default',
                };
            }
            else {
                // If null or empty, send null
                value = null;
            }
        }

        return {
            id: setting.id,
            value,
        };
    });
};

// Handle batch submit - called from SettingsForm @submit event or button click
const handleSettingsSubmit = async (updatedSettings: Setting[]) => {
    // Ensure we have the latest settings - use the ones passed in
    if (!updatedSettings || updatedSettings.length === 0) {
        toast.error(t('global.messages.error') || 'Error', {
            description: 'No settings to update',
        });
        return;
    }

    // Debug: Log the settings being sent
    console.log('Submitting settings:', updatedSettings.map(s => ({
        id: s.id,
        key: s.key,
        type: s.type,
        value: s.value,
        valueType: typeof s.value,
        isNull: s.value === null,
        isUndefined: s.value === undefined,
    })));
    if (!updatedSettings || updatedSettings.length === 0) {
        toast.error(t('global.messages.error') || 'Error', {
            description: 'No settings to update',
        });
        return;
    }

    try {
        // Transform settings to API format
        const payload = {
            settings: transformSettingsForAPI(updatedSettings),
        };

        // Make API call
        const { data, error } = await useApiFetch<{
            success: boolean;
            message: string;
            data: {
                success: boolean;
                updatedCount: number;
                errors: Array<{
                    settingId: string;
                    settingKey: string;
                    error: string;
                }>;
                updatedSettings: Setting[];
            };
        }>('/shared/settings-actions/update-many', {
            method: 'PUT',
            body: payload,
        });

        if (error.value) {
            // Handle API error response
            const errorData = error.value.data;
            if (errorData?.success === false) {
                // Validation or other errors
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    // Validation errors
                    const firstError = errorData.errors[0];
                    const errorMessage = firstError?.constraints
                        ? Object.values(firstError.constraints)[0]
                        : errorData.message || 'Validation failed';
                    toast.error(t('global.messages.validation_error') || 'Validation Error', {
                        description: errorMessage,
                        duration: 5000,
                    });
                }
                else {
                    toast.error(t('global.messages.error') || 'Error', {
                        description: errorData.message || 'Failed to update settings',
                        duration: 5000,
                    });
                }
            }
            else {
                toast.error(t('global.messages.error') || 'Error', {
                    description: errorData?.message || 'Failed to update settings',
                    duration: 5000,
                });
            }
            return;
        }

        const responseData = data.value?.data;

        if (!responseData) {
            toast.error(t('global.messages.error') || 'Error', {
                description: 'Invalid response from server',
                duration: 5000,
            });
            return;
        }

        // Handle different response cases
        if (responseData.success && responseData.errors.length === 0) {
            // All settings updated successfully
            toast.success(t('global.messages.success') || 'Success', {
                description: data.value?.message || `Successfully updated ${responseData.updatedCount} ${responseData.updatedCount === 1 ? 'setting' : 'settings'}`,
                duration: 3000,
            });

            // Refresh data on full success
            await refresh();
        }
        else if (responseData.updatedCount > 0 && responseData.errors.length > 0) {
            // Partial success - some settings updated, some failed
            const errorMessages = responseData.errors.map(err => `${err.settingKey}: ${err.error}`).join(', ');
            toast.warning(t('global.messages.partial_success') || 'Partial Success', {
                description: `${data.value?.message || `Updated ${responseData.updatedCount} ${responseData.updatedCount === 1 ? 'setting' : 'settings'}`}. Errors: ${errorMessages}`,
                duration: 6000,
            });
        }
        else if (responseData.updatedCount === 0 && responseData.errors.length > 0) {
            // All settings failed
            const errorMessages = responseData.errors.map(err => `${err.settingKey}: ${err.error}`).join(', ');
            toast.error(t('global.messages.error') || 'Error', {
                description: `${data.value?.message || 'Failed to update settings'}. Errors: ${errorMessages}`,
                duration: 6000,
            });
        }
        else {
            // Fallback
            toast.info(data.value?.message || 'Settings update completed', {
                duration: 3000,
            });
        }
    }
    catch (err: any) {
        console.error('Error updating settings:', err);
        toast.error(t('global.messages.error') || 'Error', {
            description: err?.message || 'An unexpected error occurred while updating settings',
            duration: 5000,
        });
    }
};

// Handle submit button click - get latest values from form
const handleSubmitClick = async () => {
    if (!selectedSectionData.value || !selectedSectionData.value.children) {
        return;
    }

    // Try to get latest settings from form component if available
    let latestSettings = selectedSectionData.value.children;

    if (settingsFormRef.value && typeof settingsFormRef.value.getCurrentSettings === 'function') {
        // Get the most up-to-date settings from the form component
        latestSettings = settingsFormRef.value.getCurrentSettings();
    }

    // Debug log to see what we're sending
    console.log('Current settings before submit:', latestSettings.map(s => ({
        id: s.id,
        key: s.key,
        type: s.type,
        value: s.value,
        valueType: typeof s.value,
    })));

    await handleSettingsSubmit(latestSettings);
};
</script>

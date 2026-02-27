<template>
    <div class="flex flex-col gap-6">
        <div class="flex md:flex-row flex-col  justify-between gap-2">
            <div class="text-lg flex items-center gap-2">
                <Icon
                    name="solar:settings-outline"
                    class="size-5! shrink-0 opacity-75"
                />
                <div>{{ $t('pages.settings.update_settings.title') }}</div>
            </div>
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
                    <nav class="flex flex-col gap-1 p-2 bg-accent/50 rounded-lg text-left border">
                        <div
                            v-for="section in sectionsData"
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
                                    'size-4! shrink-0',
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
import type {
    AppDomainType,
    SettingSectionWithChildren,
    UploaderValue,
    SettingUpdatePayloadItem,
    SettingsUpdateRequest,
    SettingsUpdateResponse,
    ApiErrorResponse,
} from '~/types/settings-api';
import {
    isUploaderValue,
    isSettingSectionsArray,
    isApiErrorResponse,
} from '~/types/settings-api';

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

/**
 * Available application domains
 */
const APPS: readonly AppDomainType[] = ['SHARED', 'DASHBOARD', 'SUPPORT', 'ACADEMY', 'SIGNATURE'] as const;
const DEFAULT_APP: AppDomainType = 'SHARED';

const apps = ref<readonly AppDomainType[]>(APPS);

/**
 * Get app from query params with validation
 */
const getAppFromQuery = (): AppDomainType => {
    const appQuery = route.query.app;
    if (typeof appQuery === 'string' && APPS.includes(appQuery as AppDomainType)) {
        return appQuery as AppDomainType;
    }
    return DEFAULT_APP;
};

/**
 * Get section ID from query params
 */
const getSectionFromQuery = (): string | null => {
    const sectionQuery = route.query.section;
    return typeof sectionQuery === 'string' ? sectionQuery : null;
};

// Initialize from URL params or defaults
const selectedApp = ref<AppDomainType>(getAppFromQuery());
const selectedSection = ref<string | null>(getSectionFromQuery());

// Ref to access SettingsForm component
const settingsFormRef = ref<InstanceType<typeof SettingsForm> | null>(null);

/**
 * Update URL query parameters
 */
const updateUrlParams = (): void => {
    const query: Record<string, string> = {
        ...route.query,
        app: selectedApp.value,
    };

    if (selectedSection.value) {
        query.section = selectedSection.value;
    }

    router.replace({ query });
};

/**
 * Query parameters for sections API
 */
const queryParams = reactive<{ apps: AppDomainType }>({
    apps: selectedApp.value,
});

/**
 * Fetch sections data from API
 */
const { data, error, status, refresh } = await useApiFetch<SettingSectionWithChildren[]>('/shared/settings-actions/sections', {
    method: 'GET',
    query: queryParams,
});

/**
 * Extract and validate sections data from API response
 */
const sectionsData = computed<readonly SettingSectionWithChildren[]>(() => {
    if (!data.value) {
        return [];
    }

    // Handle array response
    if (isSettingSectionsArray(data.value)) {
        return data.value;
    }

    // Handle nested data structure
    if (typeof data.value === 'object' && data.value !== null && 'data' in data.value) {
        const nestedData = (data.value as { data: unknown }).data;
        if (isSettingSectionsArray(nestedData)) {
            return nestedData;
        }
    }

    return [];
});

/**
 * Select application domain
 */
const selectApp = async (app: AppDomainType): Promise<void> => {
    if (!APPS.includes(app)) {
        console.warn(`Invalid app selected: ${app}`);
        return;
    }

    selectedApp.value = app;
    queryParams.apps = app;
    selectedSection.value = null;
    updateUrlParams();

    try {
        await refresh();
    }
    catch (err: unknown) {
        console.error('Error refreshing sections:', err);
        toast.error(t('global.messages.error') || 'Error', {
            description: 'Failed to load sections',
            duration: 5000,
        });
    }
};

/**
 * Select section by ID
 */
const selectSection = (sectionId: string): void => {
    if (!sectionId || typeof sectionId !== 'string') {
        console.warn('Invalid section ID:', sectionId);
        return;
    }

    selectedSection.value = sectionId;
    updateUrlParams();
};

/**
 * Get the currently selected section data
 */
const selectedSectionData = computed<SettingSectionWithChildren | null>(() => {
    if (!selectedSection.value || sectionsData.value.length === 0) {
        return null;
    }

    return sectionsData.value.find(
        (section: SettingSectionWithChildren) => section.id === selectedSection.value,
    ) ?? null;
});

/**
 * Auto-select first section when data loads (if no section is selected)
 */
watch(sectionsData, (newSections: readonly SettingSectionWithChildren[]) => {
    if (newSections.length === 0) {
        return;
    }

    const hasSelectedSection = selectedSection.value !== null;
    const selectedSectionExists = hasSelectedSection
        && newSections.some(
            (section: SettingSectionWithChildren) => section.id === selectedSection.value,
        );

    if (!hasSelectedSection || !selectedSectionExists) {
        selectedSection.value = newSections[0]?.id ?? null;
        if (selectedSection.value) {
            updateUrlParams();
        }
    }
}, { immediate: true });

/**
 * Handle settings update - keep parent state in sync with form
 */
const handleSettingsUpdate = (updatedSettings: readonly Setting[]): void => {
    if (!selectedSectionData.value || !Array.isArray(updatedSettings)) {
        return;
    }

    // Create a new array to maintain immutability
    selectedSectionData.value.children = [...updatedSettings];
};

/**
 * Handle individual setting change
 */
const handleSettingChange = (setting: Setting, index: number): void => {
    if (!setting || typeof index !== 'number' || index < 0) {
        console.warn('Invalid setting change:', { setting, index });
        return;
    }

    // Log for debugging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
        console.log('Setting changed:', { setting, index });
    }
};

/**
 * Transform uploader value to proper format
 */
const transformUploaderValue = (value: unknown): UploaderValue | null => {
    if (isUploaderValue(value)) {
        return {
            alt: value.alt ?? '',
            title: value.title ?? '',
            mediaId: value.mediaId ?? null,
            collection: value.collection ?? 'default',
        };
    }

    if (typeof value === 'string' && value.length > 0) {
        return {
            alt: '',
            title: '',
            mediaId: value,
            collection: 'default',
        };
    }

    return null;
};

/**
 * Transform settings to API format
 */
const transformSettingsForAPI = (settings: readonly Setting[]): SettingUpdatePayloadItem[] => {
    return settings.map((setting: Setting): SettingUpdatePayloadItem => {
        let transformedValue: unknown = setting.value;

        // Handle UPLOADER type - send full object with alt, title, mediaId, collection
        if (setting.type === SettingValueType.UPLOADER) {
            transformedValue = transformUploaderValue(setting.value);
        }

        return {
            id: setting.id,
            value: transformedValue,
        };
    });
};

/**
 * Validate settings before submission
 */
const validateSettings = (settings: readonly Setting[]): boolean => {
    if (!Array.isArray(settings) || settings.length === 0) {
        return false;
    }

    return settings.every((setting: Setting) => {
        return (
            typeof setting === 'object'
            && setting !== null
            && typeof setting.id === 'string'
            && setting.id.length > 0
        );
    });
};

/**
 * Handle batch submit - called from SettingsForm @submit event or button click
 */
const handleSettingsSubmit = async (updatedSettings: readonly Setting[]): Promise<void> => {
    // Validate settings
    if (!validateSettings(updatedSettings)) {
        toast.error(t('global.messages.error') || 'Error', {
            description: 'No valid settings to update',
        });
        return;
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.log('Submitting settings:', updatedSettings.map((s: Setting) => ({
            id: s.id,
            key: s.key,
            type: s.type,
            value: s.value,
            valueType: typeof s.value,
        })));
    }

    try {
        // Transform settings to API format
        const payload: SettingsUpdateRequest = {
            settings: transformSettingsForAPI(updatedSettings),
        };

        // Make API call
        const { data: responseData, error: responseError } = await useApiFetch<SettingsUpdateResponse>(
            '/shared/settings-actions/update-many',
            {
                method: 'PUT',
                body: payload,
            },
        );

        // Handle API error response
        if (responseError.value) {
            handleUpdateError(responseError.value);
            return;
        }

        // Validate response data
        const response = responseData.value as SettingsUpdateResponse | null;
        if (!response?.data) {
            toast.error(t('global.messages.error') || 'Error', {
                description: 'Invalid response from server',
                duration: 5000,
            });
            return;
        }

        const resultData = response.data;
        const responseMessage = response.message ?? '';

        // Handle different response cases
        handleUpdateResponse(resultData, responseMessage);
    }
    catch (err: unknown) {
        handleUpdateException(err);
    }
};

/**
 * Handle API error response
 */
const handleUpdateError = (error: unknown): void => {
    if (isApiErrorResponse(error)) {
        const errorMessage = extractErrorMessage(error);
        toast.error(t('global.messages.error') || 'Error', {
            description: errorMessage,
            duration: 5000,
        });
    }
    else {
        toast.error(t('global.messages.error') || 'Error', {
            description: 'Failed to update settings',
            duration: 5000,
        });
    }
};

/**
 * Extract error message from API error response
 */
const extractErrorMessage = (error: ApiErrorResponse): string => {
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        const firstError = error.errors[0];
        if (firstError?.constraints) {
            const constraintValues = Object.values(firstError.constraints);
            if (constraintValues.length > 0) {
                return constraintValues[0] as string;
            }
        }
    }
    return error.message ?? 'Validation failed';
};

/**
 * Handle successful update response
 */
const handleUpdateResponse = async (
    resultData: SettingsUpdateResponseData,
    responseMessage: string,
): Promise<void> => {
    const { success, updatedCount, errors } = resultData;
    const hasErrors = errors.length > 0;
    const hasUpdates = updatedCount > 0;

    if (success && !hasErrors) {
        // All settings updated successfully
        const message = responseMessage || `Successfully updated ${updatedCount} ${updatedCount === 1 ? 'setting' : 'settings'}`;
        toast.success(t('global.messages.success') || 'Success', {
            description: message,
            duration: 3000,
        });

        // Refresh data on full success
        try {
            await refresh();
        }
        catch (refreshError: unknown) {
            console.error('Error refreshing data:', refreshError);
        }
    }
    else if (hasUpdates && hasErrors) {
        // Partial success
        const errorMessages = errors
            .map((err: { settingKey: string; error: string }) => `${err.settingKey}: ${err.error}`)
            .join(', ');
        const message = responseMessage || `Updated ${updatedCount} ${updatedCount === 1 ? 'setting' : 'settings'}`;
        toast.warning(t('global.messages.partial_success') || 'Partial Success', {
            description: `${message}. Errors: ${errorMessages}`,
            duration: 6000,
        });
    }
    else if (!hasUpdates && hasErrors) {
        // All settings failed
        const errorMessages = errors
            .map((err: { settingKey: string; error: string }) => `${err.settingKey}: ${err.error}`)
            .join(', ');
        const message = responseMessage || 'Failed to update settings';
        toast.error(t('global.messages.error') || 'Error', {
            description: `${message}. Errors: ${errorMessages}`,
            duration: 6000,
        });
    }
    else {
        // Fallback
        toast.info(responseMessage || 'Settings update completed', {
            duration: 3000,
        });
    }
};

/**
 * Handle exception during update
 */
const handleUpdateException = (err: unknown): void => {
    console.error('Error updating settings:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while updating settings';
    toast.error(t('global.messages.error') || 'Error', {
        description: errorMessage,
        duration: 5000,
    });
};

/**
 * Handle submit button click - get latest values from form
 */
const handleSubmitClick = async (): Promise<void> => {
    const sectionData = selectedSectionData.value;
    if (!sectionData?.children || sectionData.children.length === 0) {
        toast.warning(t('global.messages.warning') || 'Warning', {
            description: 'No settings available to save',
            duration: 3000,
        });
        return;
    }

    // Try to get latest settings from form component if available
    let latestSettings: readonly Setting[] = sectionData.children;

    if (settingsFormRef.value && typeof settingsFormRef.value.getCurrentSettings === 'function') {
        const formSettings = settingsFormRef.value.getCurrentSettings();
        if (Array.isArray(formSettings) && formSettings.length > 0) {
            latestSettings = formSettings;
        }
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.log('Current settings before submit:', latestSettings.map((s: Setting) => ({
            id: s.id,
            key: s.key,
            type: s.type,
        })));
    }

    await handleSettingsSubmit(latestSettings);
};
</script>

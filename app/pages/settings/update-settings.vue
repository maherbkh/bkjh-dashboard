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
                            v-for="section in sectionsWithExternalData"
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
                    <!-- External Data: fixed section with custom placeholder (replace with real content later) -->
                    <div
                        v-if="selectedSection === EXTERNAL_DATA_SECTION_ID"
                        class="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-4"
                    >
                        <TooltipProvider>
                            <ul>
                                <li class="flex items-center justify-between gap-4">
                                    <div>{{ $t('pages.settings.update_settings.german_holidays') }} {{ currentYear }}</div>
                                    <div class="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            @click="checkCurrentHolidays"
                                        >
                                            <Icon
                                                name="solar:check-circle-outline"
                                                class="size-4! shrink-0"
                                            />
                                            {{ $t('pages.settings.update_settings.check_current_holidays') }}
                                        </Button>
                                    </div>
                                </li>
                            </ul>
                            <Transition
                                name="settings-external-fade"
                                mode="out-in"
                            >
                                <div
                                    v-if="compareResult"
                                    key="compare-sections"
                                    class="space-y-4"
                                >
                                    <div
                                        v-for="section in compareSections"
                                        :key="section.labelKey"
                                        class="space-y-2"
                                    >
                                        <div
                                            class="flex items-center justify-between gap-2 transition-opacity duration-200"
                                        >
                                            <div class="flex items-center gap-2">
                                                <Icon
                                                    name="solar:calendar-mark-linear"
                                                    class="size-4! shrink-0"
                                                />
                                                <div>{{ $t(section.labelKey) }} ({{ section.items.length }})</div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <button
                                                    v-if="section.sectionKey === 'missingInDb' && section.items.length > 0"
                                                    type="button"
                                                    class="flex items-center gap-2 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                                                    :class="[
                                                        'text-sm font-normal rounded-full px-4 bg-success/20 cursor-pointer text-success border border-success dark:bg-success/30 dark:text-success-foreground hover:bg-success/30 dark:hover:bg-success/40 focus-visible:ring-success/20 dark:focus-visible:ring-success/40',
                                                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                                                    ]"
                                                    :disabled="bulkUpsertPending"
                                                    @click="bulkUpsertMissingInDb"
                                                >
                                                    <Icon
                                                        v-if="bulkUpsertPending"
                                                        name="solar:refresh-outline"
                                                        class="size-4! shrink-0 animate-spin"
                                                    />
                                                    <Icon
                                                        v-else
                                                        name="solar:upload-minimalistic-linear"
                                                        class="size-4! shrink-0"
                                                    />
                                                    {{ $t('pages.settings.update_settings.upsert_missing_to_db') }}
                                                </button>
                                                <button
                                                    type="button"
                                                    class="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 ease-out"
                                                    :aria-label="compareSectionExpanded[section.sectionKey] ? $t('ui.collapse') : $t('ui.expand')"
                                                    @click="toggleCompareSection(section.sectionKey)"
                                                >
                                                    <Icon
                                                        :name="compareSectionExpanded[section.sectionKey] ? 'solar:minus-circle-linear' : 'solar:add-circle-linear'"
                                                        class="size-5! transition-transform duration-200 ease-out"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            class="section-content-wrapper"
                                            :class="{ 'section-content-expanded': compareSectionExpanded[section.sectionKey] }"
                                        >
                                            <div class="section-content-inner">
                                                <p
                                                    v-if="section.items.length === 0"
                                                    class="text-sm text-muted-foreground py-2"
                                                >
                                                    {{ $t(section.emptyMessageKey) }}
                                                </p>
                                                <div
                                                    v-else
                                                    class="max-h-[min(60vh,28rem)] overflow-y-auto overflow-x-auto scroll-app rounded border border-border"
                                                >
                                                    <table class="w-full text-sm">
                                                        <thead class="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80 border-b border-border">
                                                            <tr class="text-left bg-muted/50 border-b-2 border-border">
                                                                <th
                                                                    class="font-normal text-left p-2 cursor-pointer select-none hover:bg-muted/70"
                                                                    role="button"
                                                                    tabindex="0"
                                                                    @click="toggleSort(section.sectionKey, 'date')"
                                                                    @keydown.enter="toggleSort(section.sectionKey, 'date')"
                                                                    @keydown.space.prevent="toggleSort(section.sectionKey, 'date')"
                                                                >
                                                                    <span class="inline-flex items-center gap-1">
                                                                        {{ $t('pages.settings.update_settings.date') }}
                                                                        <Icon
                                                                            :name="getSortState(section.sectionKey).key === 'date' ? (getSortState(section.sectionKey).dir === 'asc' ? 'solar:sort-from-top-to-bottom-linear' : 'solar:sort-from-bottom-to-top-linear') : 'solar:sort-from-top-to-bottom-linear'"
                                                                            class="size-4! shrink-0 opacity-70"
                                                                            :class="getSortState(section.sectionKey).key === 'date' ? 'opacity-100' : 'opacity-40'"
                                                                        />
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    class="font-normal text-left p-2 cursor-pointer select-none hover:bg-muted/70"
                                                                    role="button"
                                                                    tabindex="0"
                                                                    @click="toggleSort(section.sectionKey, 'title')"
                                                                    @keydown.enter="toggleSort(section.sectionKey, 'title')"
                                                                    @keydown.space.prevent="toggleSort(section.sectionKey, 'title')"
                                                                >
                                                                    <span class="inline-flex items-center gap-1">
                                                                        {{ $t('pages.settings.update_settings.column_title') }}
                                                                        <Icon
                                                                            :name="getSortState(section.sectionKey).key === 'title' ? (getSortState(section.sectionKey).dir === 'asc' ? 'solar:sort-from-top-to-bottom-linear' : 'solar:sort-from-bottom-to-top-linear') : 'solar:sort-from-top-to-bottom-linear'"
                                                                            class="size-4! shrink-0 opacity-70"
                                                                            :class="getSortState(section.sectionKey).key === 'title' ? 'opacity-100' : 'opacity-40'"
                                                                        />
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    class="font-normal text-left p-2 cursor-pointer select-none hover:bg-muted/70"
                                                                    role="button"
                                                                    tabindex="0"
                                                                    @click="toggleSort(section.sectionKey, 'stateCode')"
                                                                    @keydown.enter="toggleSort(section.sectionKey, 'stateCode')"
                                                                    @keydown.space.prevent="toggleSort(section.sectionKey, 'stateCode')"
                                                                >
                                                                    <span class="inline-flex items-center gap-1">
                                                                        {{ $t('pages.settings.update_settings.state_code') }}
                                                                        <Icon
                                                                            :name="getSortState(section.sectionKey).key === 'stateCode' ? (getSortState(section.sectionKey).dir === 'asc' ? 'solar:sort-from-top-to-bottom-linear' : 'solar:sort-from-bottom-to-top-linear') : 'solar:sort-from-top-to-bottom-linear'"
                                                                            class="size-4! shrink-0 opacity-70"
                                                                            :class="getSortState(section.sectionKey).key === 'stateCode' ? 'opacity-100' : 'opacity-40'"
                                                                        />
                                                                    </span>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <TransitionGroup
                                                            tag="tbody"
                                                            name="table-row"
                                                        >
                                                            <tr
                                                                v-for="(item, idx) in getSortedItems(section.sectionKey, section.items)"
                                                                :key="`${section.labelKey}-${idx}-${item.date}-${item.stateCode}`"
                                                                class="table-row font-light text-left border-b border-border"
                                                                :style="{ '--row-index': idx }"
                                                            >
                                                                <td class="py-1 px-2">
                                                                    {{ formatHolidayDate(item.date) }}
                                                                </td>
                                                                <td class="py-1 px-2">
                                                                    <span class="inline-flex items-center gap-1.5">
                                                                        {{ item.title }}
                                                                        <Tooltip
                                                                            v-if="item.description != null && String(item.description).trim() !== ''"
                                                                        >
                                                                            <TooltipTrigger as-child>
                                                                                <span
                                                                                    class="inline-flex shrink-0 text-primary cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                                                                    role="img"
                                                                                    :aria-label="$t('common.information')"
                                                                                >
                                                                                    <Icon
                                                                                        name="solar:info-circle-linear"
                                                                                        class="size-4!"
                                                                                    />
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent
                                                                                class="max-w-sm text-sm whitespace-pre-wrap wrap-break-word"
                                                                                side="top"
                                                                            >
                                                                                <div
                                                                                    class="text-primary-foreground prose prose-sm dark:prose-invert max-w-none"
                                                                                    v-html="item.description"
                                                                                />
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </span>
                                                                </td>
                                                                <td class="py-1 px-2">
                                                                    {{ item.stateCode }}
                                                                </td>
                                                            </tr>
                                                        </TransitionGroup>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p
                                    v-else
                                    key="hint"
                                    class="text-sm text-muted-foreground"
                                >
                                    {{ $t('pages.settings.update_settings.holidays_compare_hint') }}
                                </p>
                            </Transition>
                        </TooltipProvider>
                    </div>
                    <template v-else-if="selectedSectionData && selectedSectionData.children && selectedSectionData.children.length > 0">
                        <SettingsForm
                            ref="settingsFormRef"
                            :key="`settings-${selectedSection}-${selectedSectionData.children.length}`"
                            :settings="selectedSectionData.children"
                            :emit-mode="'both'"
                            @update:settings="handleSettingsUpdate"
                            @change="handleSettingChange"
                            @submit="(settings) => handleSettingsSubmit(settings)"
                        />
                        <div class="w-full mt-4">
                            <Button
                                class="w-full"
                                @click="handleSubmitClick"
                            >
                                {{ $t('action.save') || 'Save' }}
                            </Button>
                        </div>
                    </template>
                    <div
                        v-else-if="selectedSectionData && (!selectedSectionData.children || selectedSectionData.children.length === 0)"
                        class="text-center py-12"
                    >
                        <Icon
                            name="solar:settings-outline"
                            class="size-12! mx-auto mb-4 text-muted-foreground opacity-50"
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
                            class="size-12! mx-auto mb-4 text-muted-foreground opacity-50"
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
const dayjs = useDayjs();

const currentYear = computed(() => dayjs().format('YYYY'));

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

/**
 * Fixed section ID for External Data (custom content, not from API)
 */
const EXTERNAL_DATA_SECTION_ID = 'external-data';

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
 * Fixed "External Data" section (custom placeholder content)
 */
const externalDataSection = computed<SettingSectionWithChildren>(() => ({
    id: EXTERNAL_DATA_SECTION_ID,
    name: t('pages.settings.update_settings.external_data'),
    type: SettingValueType.STRING,
    children: [],
}));

/**
 * Sections list with External Data appended (last in nav)
 */
const sectionsWithExternalData = computed<readonly SettingSectionWithChildren[]>(() => [
    ...sectionsData.value,
    externalDataSection.value,
]);

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
    if (!selectedSection.value || sectionsWithExternalData.value.length === 0) {
        return null;
    }

    return sectionsWithExternalData.value.find(
        (section: SettingSectionWithChildren) => section.id === selectedSection.value,
    ) ?? null;
});

/**
 * Auto-select first section when data loads (if no section is selected)
 */
watch(sectionsWithExternalData, (newSections: readonly SettingSectionWithChildren[]) => {
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

/** Holiday item from compare API */
interface HolidayCompareItem {
    id?: string;
    stateCode: string;
    title: string;
    date: string;
    description: string | null;
}

/** Compare API response payload (response.data) */
interface HolidaysComparePayload {
    existDuplications: HolidayCompareItem[];
    missingInApi: HolidayCompareItem[];
    missingInDb: HolidayCompareItem[];
}

type HolidaySortKey = 'date' | 'title' | 'stateCode';
type CompareSectionKey = 'existDuplications' | 'missingInApi' | 'missingInDb';

const compareResult = ref<HolidaysComparePayload | null>(null);

const compareSectionExpanded = ref<Record<CompareSectionKey, boolean>>({
    existDuplications: true,
    missingInApi: true,
    missingInDb: true,
});

const toggleCompareSection = (sectionKey: CompareSectionKey): void => {
    compareSectionExpanded.value = {
        ...compareSectionExpanded.value,
        [sectionKey]: !compareSectionExpanded.value[sectionKey],
    };
};

const sectionSortState = ref<Partial<Record<CompareSectionKey, { key: HolidaySortKey; dir: 'asc' | 'desc' }>>>({});

const defaultSort = (): { key: HolidaySortKey; dir: 'asc' | 'desc' } => ({ key: 'date', dir: 'asc' });

const getSortState = (sectionKey: CompareSectionKey) =>
    sectionSortState.value[sectionKey] ?? defaultSort();

const toggleSort = (sectionKey: CompareSectionKey, columnKey: HolidaySortKey): void => {
    const current = getSortState(sectionKey);
    const nextDir = current.key === columnKey && current.dir === 'asc' ? 'desc' : 'asc';
    sectionSortState.value = {
        ...sectionSortState.value,
        [sectionKey]: { key: columnKey, dir: nextDir },
    };
};

const getSortedItems = (sectionKey: CompareSectionKey, items: HolidayCompareItem[]): HolidayCompareItem[] => {
    if (items.length === 0) return [];
    const { key, dir } = getSortState(sectionKey);
    return [...items].sort((a, b) => {
        let cmp = 0;
        if (key === 'date') cmp = a.date.localeCompare(b.date);
        else if (key === 'title') cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        else if (key === 'stateCode') cmp = a.stateCode.localeCompare(b.stateCode);
        return dir === 'asc' ? cmp : -cmp;
    });
};

const compareSections = computed<{ sectionKey: CompareSectionKey; labelKey: string; emptyMessageKey: string; items: HolidayCompareItem[] }[]>(() => {
    if (!compareResult.value) return [];
    return [
        { sectionKey: 'existDuplications', labelKey: 'pages.settings.update_settings.exist_duplications', emptyMessageKey: 'pages.settings.update_settings.no_records_duplicated', items: compareResult.value.existDuplications },
        { sectionKey: 'missingInApi', labelKey: 'pages.settings.update_settings.missing_in_api', emptyMessageKey: 'pages.settings.update_settings.no_records_missing_in_api', items: compareResult.value.missingInApi },
        { sectionKey: 'missingInDb', labelKey: 'pages.settings.update_settings.missing_in_db', emptyMessageKey: 'pages.settings.update_settings.no_records_missing_in_db', items: compareResult.value.missingInDb },
    ];
});

const formatHolidayDate = (dateStr: string): string => {
    const d = dayjs(dateStr);
    return d.isValid() ? `${dateStr} (${d.format('dddd')})` : dateStr;
};

const checkCurrentHolidays = async (): Promise<void> => {
    compareResult.value = null;
    const { data, error } = await useApiFetch<{ success: boolean; message?: string; data: HolidaysComparePayload }>(`/shared/working-time/holidays/compare?year=${currentYear.value}`, {
        method: 'GET',
    });
    if (error.value) {
        toast.error(t('global.messages.error') || 'Error', {
            description: 'Failed to load holidays compare',
            duration: 5000,
        });
        return;
    }
    const payload = data.value?.data;
    if (payload && typeof payload === 'object' && Array.isArray(payload.existDuplications) && Array.isArray(payload.missingInApi) && Array.isArray(payload.missingInDb)) {
        compareResult.value = payload;
    }
};

const bulkUpsertPending = ref(false);

interface BulkUpsertResponse {
    success: boolean;
    message?: string;
    data?: { created: number; updated: number };
}

const bulkUpsertMissingInDb = async (): Promise<void> => {
    if (!compareResult.value || compareResult.value.missingInDb.length === 0) return;
    bulkUpsertPending.value = true;
    try {
        const { data: responseData, error: responseError } = await useApiFetch<BulkUpsertResponse>('/shared/working-time/holidays/bulk-upsert', {
            method: 'POST',
            body: {
                items: compareResult.value.missingInDb.map(item => ({
                    stateCode: item.stateCode,
                    title: item.title,
                    date: item.date,
                    description: item.description,
                })),
            },
        });
        if (responseError.value) {
            toast.error(t('global.messages.error') || 'Error', {
                description: 'Failed to upsert holidays',
                duration: 5000,
            });
            return;
        }
        const counts = responseData.value?.data;
        if (responseData.value?.success && counts !== undefined) {
            toast.success(t('pages.settings.update_settings.bulk_upsert_success'), {
                description: t('pages.settings.update_settings.bulk_upsert_result', { created: counts.created, updated: counts.updated }),
                duration: 5000,
            });
            await checkCurrentHolidays();
        }
    }
    finally {
        bulkUpsertPending.value = false;
    }
};
</script>

<style scoped>
.settings-external-fade-enter-active,
.settings-external-fade-leave-active {
    transition: opacity 0.2s ease;
}
.settings-external-fade-enter-from,
.settings-external-fade-leave-to {
    opacity: 0;
}
.settings-external-fade-enter-to,
.settings-external-fade-leave-from {
    opacity: 1;
}

/* Section expand/collapse with smooth easing in and out */
.section-content-wrapper {
    max-height: 0;
    overflow: hidden;
    transition:
        max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.2s ease;
}
.section-content-wrapper.section-content-expanded {
    max-height: 3000px;
}
.section-content-inner {
    overflow: hidden;
}

/* Staggered table row enter/leave */
.table-row-enter-active {
    transition:
        opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: calc(var(--row-index, 0) * 22ms);
}
.table-row-enter-from {
    opacity: 0;
    transform: translateY(-6px);
}
.table-row-enter-to {
    opacity: 1;
    transform: translateY(0);
}
.table-row-leave-active {
    transition:
        opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.table-row-leave-from {
    opacity: 1;
    transform: translateY(0);
}
.table-row-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>

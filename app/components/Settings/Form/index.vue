<template>
    <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
    >
        <div
            v-if="localSettings.length === 0"
            class="text-center py-12"
        >
            <p class="text-muted-foreground text-sm">
                No settings to display
            </p>
        </div>
        <div
            v-for="(setting, index) in localSettings"
            :key="setting.id"
            class="pb-6 border-b last:border-b-0 last:pb-0"
        >
            <!-- STRING Type -->
            <FormItemInput
                v-if="setting.type === SettingValueType.STRING"
                :id="`setting-${setting.id}-value`"
                v-model="settingValues[index]"
                :title="setting.name || keyToLabel(setting.key)"
                :placeholder="$t('setting.value_placeholder') || 'Enter value'"
                :disabled="disabled || readonly"
                :readonly="readonly"
                :errors="settingErrors[index] || []"
                @update:model-value="(val) => handleValueChange(index, val)"
            />

            <!-- NUMBER Type -->
            <FormItemInput
                v-else-if="setting.type === SettingValueType.NUMBER"
                :id="`setting-${setting.id}-value`"
                v-model="settingValues[index]"
                type="number"
                :title="setting.name || keyToLabel(setting.key)"
                :placeholder="$t('setting.value_placeholder') || 'Enter number'"
                :disabled="disabled || readonly"
                :readonly="readonly"
                :errors="settingErrors[index] || []"
                @update:model-value="(val) => handleValueChange(index, val)"
            />

            <!-- BOOLEAN Type -->
            <FormItemSwitch
                v-else-if="setting.type === SettingValueType.BOOLEAN"
                :id="`setting-${setting.id}-value`"
                v-model="settingValues[index]"
                :title="setting.name || keyToLabel(setting.key)"
                :true-label="$t('common.true') || 'True'"
                :false-label="$t('common.false') || 'False'"
                :disabled="disabled || readonly"
                :errors="settingErrors[index] || []"
                @update:model-value="(val) => handleValueChange(index, val)"
            />

            <!-- JSON Type -->
            <div v-else-if="setting.type === SettingValueType.JSON">
                <div class="flex items-center justify-between mb-2">
                    <Label :for="`setting-${setting.id}-value`">
                        {{ setting.name || keyToLabel(setting.key) }}
                    </Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        :disabled="disabled || readonly"
                        @click="toggleJsonView(index)"
                    >
                        <Icon
                            :name="(jsonViewMode[index] || 'structured') === 'text' ? 'solar:text-field-outline' : 'solar:code-2-outline'"
                            class="!size-4 mr-1"
                        />
                        {{ (jsonViewMode[index] || 'structured') === 'text' ? 'Text View' : 'Structured View' }}
                    </Button>
                </div>

                <!-- JSON Text View -->
                <FormItemTextarea
                    v-if="(jsonViewMode[index] || 'structured') === 'text'"
                    :id="`setting-${setting.id}-value`"
                    v-model="settingValues[index]"
                    :title="''"
                    :placeholder="t('setting.value_json_placeholder') || 'Enter JSON'"
                    :disabled="disabled || readonly"
                    :readonly="readonly"
                    :rows="8"
                    :errors="settingErrors[index] || []"
                    @update:model-value="(val) => handleJsonTextChange(index, val)"
                />

                <!-- JSON Structured View -->
                <div
                    v-else
                    class="space-y-3"
                >
                    <!-- Array View -->
                    <template v-if="Array.isArray(parsedJsonValues[index])">
                        <div
                            v-for="(item, itemIndex) in parsedJsonValues[index]"
                            :key="itemIndex"
                            class="border rounded-lg p-4 space-y-3"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <Collapsible
                                    :default-open="true"
                                    class="flex-1 group/collapsible"
                                >
                                    <CollapsibleTrigger
                                        class="flex items-center gap-2 w-full text-left font-medium hover:opacity-80 transition-opacity"
                                    >
                                        <Icon
                                            name="solar:alt-arrow-down-outline"
                                            class="!size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-0 rotate-90"
                                        />
                                        <span>Item {{ itemIndex + 1 }}</span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent class="mt-2 space-y-3">
                                        <div
                                            v-for="(propValue, propKey) in item"
                                            :key="propKey"
                                            class="space-y-2"
                                        >
                                            <FormItemInput
                                                :id="`setting-${setting.id}-array-${itemIndex}-${propKey}`"
                                                v-model="parsedJsonValues[index][itemIndex][propKey]"
                                                :title="String(propKey)"
                                                :placeholder="`Enter ${propKey}`"
                                                :disabled="disabled || readonly"
                                                :readonly="readonly"
                                                @update:model-value="() => handleJsonStructuredChange(index)"
                                            />
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    class="ml-2 text-destructive hover:text-destructive"
                                    :disabled="disabled || readonly"
                                    @click="removeArrayItem(index, itemIndex)"
                                >
                                    <Icon
                                        name="solar:trash-bin-minimalistic-outline"
                                        class="!size-4"
                                    />
                                </Button>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="w-full"
                            :disabled="disabled || readonly"
                            @click="addArrayItem(index)"
                        >
                            <Icon
                                name="solar:add-circle-outline"
                                class="!size-4 mr-2"
                            />
                            Add Item
                        </Button>
                    </template>

                    <!-- Object View -->
                    <template v-else>
                        <div
                            v-for="(jsonValue, jsonKey) in parsedJsonValues[index]"
                            :key="jsonKey"
                            class="space-y-2"
                        >
                            <FormItemInput
                                :id="`setting-${setting.id}-json-${jsonKey}`"
                                v-model="parsedJsonValues[index][jsonKey]"
                                :title="String(jsonKey)"
                                :placeholder="`Enter ${jsonKey}`"
                                :disabled="disabled || readonly"
                                :readonly="readonly"
                                @update:model-value="() => handleJsonStructuredChange(index)"
                            />
                        </div>
                    </template>
                </div>
            </div>

            <!-- DATE Type -->
            <FormItemDatePicker
                v-else-if="setting.type === SettingValueType.DATE"
                :id="`setting-${setting.id}-value`"
                :model-value="settingValues[index]"
                :label="setting.name || keyToLabel(setting.key)"
                :placeholder="$t('setting.value_date_placeholder') || 'Select date'"
                :disabled="disabled || readonly"
                :readonly="readonly"
                :time-picker="false"
                format="yyyy-MM-dd"
                :name="`setting-${setting.id}-value`"
                :errors="settingErrors[index] || []"
                @update:model-value="(val) => handleValueChange(index, String(val))"
            />

            <!-- ARRAY Type -->
            <FormItemTextarea
                v-else-if="setting.type === SettingValueType.ARRAY"
                :id="`setting-${setting.id}-value`"
                v-model="settingValues[index]"
                :title="setting.name || keyToLabel(setting.key)"
                :placeholder="t('setting.value_array_placeholder') || 'Enter array as JSON (e.g., [1, 2, 3])'"
                :disabled="disabled || readonly"
                :readonly="readonly"
                :rows="4"
                :errors="settingErrors[index] || []"
                @update:model-value="(val) => handleArrayChange(index, val)"
            />

            <!-- UPLOADER Type -->
            <div v-else-if="setting.type === SettingValueType.UPLOADER">
                <Label class="text-base font-medium mb-4 block">
                    {{ setting.name || setting.key }}
                </Label>
                <div class="space-y-4">
                    <FormItemInput
                        :id="`setting-${setting.id}-alt`"
                        v-model="uploaderFields[index].alt"
                        :title="$t('setting.alt') || 'Alt Text'"
                        :placeholder="$t('setting.alt_placeholder') || 'Enter alt text'"
                        :disabled="disabled || readonly"
                        :readonly="readonly"
                        :errors="[]"
                        @update:model-value="() => handleUploaderChange(index)"
                    />

                    <FormItemInput
                        :id="`setting-${setting.id}-title`"
                        v-model="uploaderFields[index].title"
                        :title="$t('setting.title') || 'Title'"
                        :placeholder="$t('setting.title_placeholder') || 'Enter title'"
                        :disabled="disabled || readonly"
                        :readonly="readonly"
                        :errors="[]"
                        @update:model-value="() => handleUploaderChange(index)"
                    />

                    <FormItemMedia
                        :id="`setting-${setting.id}-media`"
                        v-model="uploaderFields[index].media"
                        :label="$t('setting.media') || 'Media'"
                        :collection-name="CollectionTypeEnum.DEFAULT"
                        :multiple="false"
                        :max-files="1"
                        :disabled="disabled || readonly"
                        :errors="settingErrors[index] || []"
                        show-manager
                        @update:model-value="() => handleUploaderChange(index)"
                    />
                </div>
            </div>

            <!-- SECTION Type -->
            <div
                v-else-if="setting.type === SettingValueType.SECTION"
                class="text-sm text-muted-foreground py-2"
            >
                {{ $t('setting.section_no_value') || 'Section type does not require a value' }}
            </div>
        </div>

        <!-- Submit Button (for batch mode) -->
        <div
            v-if="showSubmitButton"
            class="flex justify-end gap-2 pt-4 border-t"
        >
            <Button
                type="button"
                variant="outline"
                :disabled="disabled || isSubmitting"
                @click="$emit('cancel')"
            >
                {{ $t('action.cancel') }}
            </Button>
            <Button
                type="submit"
                :disabled="disabled || isSubmitting"
            >
                <Icon
                    v-if="isSubmitting"
                    name="solar:refresh-outline"
                    class="animate-spin mr-2 h-4 w-4"
                />
                {{ $t('action.save') || 'Save' }}
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import type { Setting } from '~/types';
import type { MediaEntity } from '~/types/media/index';
import { SettingValueType } from '~/types/settings';
import { CollectionType as CollectionTypeEnum } from '~/types/media/index';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
    settings: Setting[];
    disabled?: boolean;
    readonly?: boolean;
    showSubmitButton?: boolean;
    emitMode?: 'individual' | 'batch' | 'both';
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    readonly: false,
    showSubmitButton: false,
    emitMode: 'both',
});

const emit = defineEmits<{
    'update:settings': [settings: Setting[]];
    'submit': [settings: Setting[]];
    'change': [setting: Setting, index: number];
    'cancel': [];
}>();

const { t } = useI18n();
const { keyToLabel } = useKeyToLabel();

// Local state for settings
const localSettings = ref<Setting[]>([...props.settings]);

// Values for each setting (string representation for inputs)
const settingValues = ref<(string | number | boolean)[]>([]);

// Parsed JSON values for structured view (can be object or array)
const parsedJsonValues = ref<Record<number, Record<string, any> | any[]>>({});

// JSON view mode: 'text' or 'structured'
const jsonViewMode = ref<Record<number, 'text' | 'structured'>>({});

// Uploader fields state
const uploaderFields = ref<Record<number, { alt: string; title: string; media: MediaEntity | null }>>({});

// Errors for each setting
const settingErrors = ref<Record<number, string[]>>({});

// Loading state
const isSubmitting = ref(false);

// Initialize values based on setting types
const initializeValues = () => {
    if (!localSettings.value || localSettings.value.length === 0) {
        settingValues.value = [];
        return;
    }

    settingValues.value = localSettings.value.map((setting, index) => {
        const value = setting.value;

        switch (setting.type) {
            case SettingValueType.STRING:
                return value === null || value === undefined ? '' : String(value);
            case SettingValueType.NUMBER:
                return value === null || value === undefined ? 0 : Number(value);
            case SettingValueType.BOOLEAN:
                return Boolean(value);
            case SettingValueType.JSON:
                if (typeof value === 'string') {
                    try {
                        const parsed = JSON.parse(value);
                        // Handle both arrays and objects
                        if (Array.isArray(parsed)) {
                            parsedJsonValues.value[index] = [...parsed];
                        }
                        else if (typeof parsed === 'object' && parsed !== null) {
                            parsedJsonValues.value[index] = { ...parsed as Record<string, any> };
                        }
                        else {
                            parsedJsonValues.value[index] = {};
                        }
                        return value;
                    }
                    catch {
                        parsedJsonValues.value[index] = {};
                        return value;
                    }
                }
                else if (typeof value === 'object' && value !== null) {
                    // Handle both arrays and objects
                    if (Array.isArray(value)) {
                        parsedJsonValues.value[index] = [...value];
                    }
                    else {
                        parsedJsonValues.value[index] = { ...value as Record<string, any> };
                    }
                    return JSON.stringify(value, null, 2);
                }
                parsedJsonValues.value[index] = {};
                return '';
            case SettingValueType.ARRAY:
                return Array.isArray(value) ? JSON.stringify(value) : '';
            case SettingValueType.DATE:
                return typeof value === 'string' ? value : '';
            case SettingValueType.UPLOADER:
                if (typeof value === 'object' && value !== null) {
                    const uploaderValue = value as { mediaId?: string | null; alt?: string; title?: string };
                    uploaderFields.value[index] = {
                        alt: uploaderValue.alt || '',
                        title: uploaderValue.title || '',
                        media: null, // Will be fetched if mediaId exists
                    };
                    if (uploaderValue.mediaId) {
                        fetchMediaById(index, uploaderValue.mediaId);
                    }
                }
                else {
                    uploaderFields.value[index] = {
                        alt: '',
                        title: '',
                        media: null,
                    };
                }
                return '';
            case SettingValueType.SECTION:
            default:
                return '';
        }
    });

    // Initialize JSON view mode to 'structured' for all JSON settings (default is structured view)
    props.settings.forEach((setting, index) => {
        if (setting.type === SettingValueType.JSON) {
            // Default to 'structured' view if not already set
            if (!jsonViewMode.value[index]) {
                jsonViewMode.value[index] = 'structured';
            }
        }
    });
};

// Fetch media by ID for uploader type
const fetchMediaById = async (index: number, mediaId: string) => {
    try {
        const { data } = await useApiFetch<{ success: boolean; message: string; data: MediaEntity }>(`/shared/media/${mediaId}`, {
            method: 'GET',
        });
        const response = data.value as unknown as { success?: boolean; message?: string; data?: MediaEntity } | null;
        if (response?.data) {
            uploaderFields.value[index].media = response.data;
        }
    }
    catch (error) {
        console.error('Error fetching media:', error);
        uploaderFields.value[index].media = null;
    }
};

// Toggle JSON view mode
const toggleJsonView = (index: number) => {
    if (jsonViewMode.value[index] === 'text') {
        // Switch to structured view - parse JSON
        try {
            const parsed = JSON.parse(settingValues.value[index] as string || '{}');
            // Handle both arrays and objects
            if (Array.isArray(parsed)) {
                parsedJsonValues.value[index] = [...parsed];
            }
            else if (typeof parsed === 'object' && parsed !== null) {
                parsedJsonValues.value[index] = { ...parsed as Record<string, any> };
            }
            else {
                parsedJsonValues.value[index] = {};
            }
            jsonViewMode.value[index] = 'structured';
        }
        catch (error) {
            settingErrors.value[index] = ['Invalid JSON format'];
        }
    }
    else {
        // Switch to text view - stringify JSON
        try {
            const jsonString = JSON.stringify(parsedJsonValues.value[index], null, 2);
            settingValues.value[index] = jsonString;
            jsonViewMode.value[index] = 'text';
            settingErrors.value[index] = [];
        }
        catch (error) {
            settingErrors.value[index] = ['Error converting to JSON'];
        }
    }
};

// Handle value changes
const handleValueChange = (index: number, val: any) => {
    const setting = localSettings.value[index];
    let newValue: any = val;

    // Convert based on type
    switch (setting.type) {
        case SettingValueType.NUMBER:
            newValue = val === '' ? null : Number(val);
            break;
        case SettingValueType.BOOLEAN:
            newValue = Boolean(val);
            break;
        case SettingValueType.STRING:
        case SettingValueType.DATE:
            newValue = String(val);
            break;
        default:
            newValue = val;
    }

    // Update local setting
    const updatedSetting = {
        ...setting,
        value: newValue,
    };
    localSettings.value[index] = updatedSetting;

    // Emit updates
    if (props.emitMode === 'individual' || props.emitMode === 'both') {
        emit('change', updatedSetting, index);
        emit('update:settings', [...localSettings.value]);
    }
};

// Handle JSON text change
const handleJsonTextChange = (index: number, val: string) => {
    settingValues.value[index] = val;
    settingErrors.value[index] = [];

    try {
        const parsed = JSON.parse(val);
        // Handle both arrays and objects
        if (Array.isArray(parsed)) {
            parsedJsonValues.value[index] = [...parsed];
        }
        else if (typeof parsed === 'object' && parsed !== null) {
            parsedJsonValues.value[index] = { ...parsed as Record<string, any> };
        }
        else {
            parsedJsonValues.value[index] = parsed;
        }

        const updatedSetting = {
            ...localSettings.value[index],
            value: parsed,
        };
        localSettings.value[index] = updatedSetting;

        if (props.emitMode === 'individual' || props.emitMode === 'both') {
            emit('change', updatedSetting, index);
            emit('update:settings', [...localSettings.value]);
        }
    }
    catch (error) {
        settingErrors.value[index] = ['Invalid JSON format'];
    }
};

// Handle JSON structured change
const handleJsonStructuredChange = (index: number) => {
    try {
        const currentValue = parsedJsonValues.value[index];
        let jsonValue: any;

        // Handle both arrays and objects
        if (Array.isArray(currentValue)) {
            jsonValue = [...currentValue];
        }
        else if (typeof currentValue === 'object' && currentValue !== null) {
            jsonValue = { ...currentValue as Record<string, any> };
        }
        else {
            jsonValue = currentValue;
        }

        const updatedSetting = {
            ...localSettings.value[index],
            value: jsonValue,
        };
        localSettings.value[index] = updatedSetting;

        // Update text view value
        settingValues.value[index] = JSON.stringify(jsonValue, null, 2);

        if (props.emitMode === 'individual' || props.emitMode === 'both') {
            emit('change', updatedSetting, index);
            emit('update:settings', [...localSettings.value]);
        }
    }
    catch (error) {
        settingErrors.value[index] = ['Error updating JSON'];
    }
};

// Add array item
const addArrayItem = (index: number) => {
    const currentValue = parsedJsonValues.value[index];
    if (!Array.isArray(currentValue)) {
        return;
    }

    // Create a new item based on the structure of existing items
    // If there are existing items, clone the first one; otherwise create an empty object
    const newItem = currentValue.length > 0
        ? { ...currentValue[0] }
        : {};

    // Clear all string values in the new item
    Object.keys(newItem).forEach((key) => {
        if (typeof newItem[key] === 'string') {
            newItem[key] = '';
        }
    });

    parsedJsonValues.value[index] = [...currentValue, newItem];
    handleJsonStructuredChange(index);
};

// Remove array item
const removeArrayItem = (index: number, itemIndex: number) => {
    const currentValue = parsedJsonValues.value[index];
    if (!Array.isArray(currentValue)) {
        return;
    }

    parsedJsonValues.value[index] = currentValue.filter((_, i) => i !== itemIndex);
    handleJsonStructuredChange(index);
};

// Handle array change
const handleArrayChange = (index: number, val: string) => {
    settingValues.value[index] = val;
    settingErrors.value[index] = [];

    try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
            throw new Error('Value must be an array');
        }

        const updatedSetting = {
            ...localSettings.value[index],
            value: parsed,
        };
        localSettings.value[index] = updatedSetting;

        if (props.emitMode === 'individual' || props.emitMode === 'both') {
            emit('change', updatedSetting, index);
            emit('update:settings', [...localSettings.value]);
        }
    }
    catch (error) {
        settingErrors.value[index] = ['Invalid array format. Must be valid JSON array.'];
    }
};

// Handle uploader change
const handleUploaderChange = (index: number) => {
    const uploaderData = uploaderFields.value[index];
    const uploaderValue = {
        mediaId: uploaderData.media?.id || null,
        alt: uploaderData.alt || '',
        title: uploaderData.title || '',
        collection: 'default',
    };

    const updatedSetting = {
        ...localSettings.value[index],
        value: uploaderValue,
    };
    localSettings.value[index] = updatedSetting;

    if (props.emitMode === 'individual' || props.emitMode === 'both') {
        emit('change', updatedSetting, index);
        emit('update:settings', [...localSettings.value]);
    }
};

// Handle form submit
const handleSubmit = () => {
    isSubmitting.value = true;
    try {
        emit('submit', [...localSettings.value]);
    }
    finally {
        isSubmitting.value = false;
    }
};

// Expose method to get current settings
defineExpose({
    getCurrentSettings: () => [...localSettings.value],
    submit: handleSubmit,
});

// Watch for props changes
watch(() => props.settings, (newSettings) => {
    if (newSettings && newSettings.length > 0) {
        localSettings.value = [...newSettings];
        initializeValues();
    }
    else {
        localSettings.value = [];
        settingValues.value = [];
    }
}, { deep: true, immediate: true });

// Initialize on mount
onMounted(() => {
    if (props.settings && props.settings.length > 0) {
        localSettings.value = [...props.settings];
        initializeValues();
    }
});
</script>

<script setup lang="ts">
import FormItemInput from './Input.vue';
import { Button } from '~/components/ui/button';

interface ArrayInputProps {
    id?: string;
    title?: string;
    placeholder?: string;
    modelValue?: string[] | null;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    errors?: string[];
    addButtonText?: string;
    emptyMessage?: string;
    minItems?: number;
    maxItems?: number;
    itemIdPrefix?: string;
}

const props = withDefaults(defineProps<ArrayInputProps>(), {
    modelValue: () => [],
    disabled: false,
    readonly: false,
    required: false,
    errors: () => [],
    addButtonText: 'Add Item',
    emptyMessage: undefined,
    minItems: 0,
    maxItems: 0,
    itemIdPrefix: 'item',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
}>();

// Internal state - use shallowRef for memory efficiency (only tracks array reference)
const internalArray = shallowRef<string[]>([]);

// Normalize array - ensure it's always a valid array (don't trim, preserve user input)
const normalizeArray = (value: string[] | null | undefined): string[] => {
    if (!Array.isArray(value)) return [];
    return value.map(item => String(item || ''));
};

// Initialize internal array from modelValue
const initializeArray = () => {
    internalArray.value = normalizeArray(props.modelValue);
};

// Watch for external modelValue changes - optimized comparison
watch(() => props.modelValue, (newValue) => {
    const normalized = normalizeArray(newValue);
    const current = internalArray.value;
    
    // Quick reference check first
    if (current === normalized) return;
    
    // Length check for early exit
    if (current.length !== normalized.length) {
        internalArray.value = normalized;
        return;
    }
    
    // Deep comparison only if lengths match
    let hasChanged = false;
    for (let i = 0; i < current.length; i++) {
        if (current[i] !== normalized[i]) {
            hasChanged = true;
            break;
        }
    }
    
    if (hasChanged) {
        internalArray.value = normalized;
    }
}, { immediate: true, deep: false });

// Computed for normalized array (ensures type safety)
const normalizedArray = computed(() => {
    return Array.isArray(internalArray.value) ? internalArray.value : [];
});

// Computed to check if we can add more items
const canAdd = computed(() => {
    if (props.disabled || props.readonly) return false;
    if (props.maxItems > 0 && normalizedArray.value.length >= props.maxItems) return false;
    return true;
});

// Computed to check if we can remove items
const canRemove = computed(() => {
    if (props.disabled || props.readonly) return false;
    if (props.minItems > 0 && normalizedArray.value.length <= props.minItems) return false;
    return true;
});

// Check if item at index can be removed
const canRemoveItem = (index: number): boolean => {
    if (!canRemove.value) return false;
    if (props.minItems > 0 && normalizedArray.value.length <= props.minItems) return false;
    return index >= 0 && index < normalizedArray.value.length;
};

// Check for errors
const hasErrors = computed(() => props.errors && props.errors.length > 0);

// Get error for specific item index
const getItemError = (index: number): string[] => {
    // Check for per-item errors (e.g., errors['topics.0'])
    const itemErrorKey = `${props.id || 'array'}.${index}`;
    const itemError = props.errors.find(err => 
        typeof err === 'string' && err.includes(itemErrorKey)
    );
    if (itemError) return [itemError];
    
    // Check for errors[index] pattern
    if (props.errors[index]) return [String(props.errors[index])];
    
    return [];
};

// Add new item to array
const addItem = (): void => {
    if (!canAdd.value) return;
    
    // Create new array with added empty string
    const newArray = [...normalizedArray.value, ''];
    internalArray.value = newArray;
    emit('update:modelValue', newArray);
};

// Remove item from array by index
const removeItem = (index: number): void => {
    if (!canRemoveItem(index)) return;
    
    // Use splice for efficient in-place modification, then create new array for reactivity
    const newArray = [...normalizedArray.value];
    newArray.splice(index, 1);
    internalArray.value = newArray;
    emit('update:modelValue', newArray);
};

// Update item at specific index
const updateItem = (index: number, value: string | null): void => {
    if (index < 0 || index >= normalizedArray.value.length) return;
    
    // Direct index assignment with new array reference for reactivity
    const newArray = [...normalizedArray.value];
    newArray[index] = value || '';
    internalArray.value = newArray;
    emit('update:modelValue', newArray);
};

// Initialize on mount
onMounted(() => {
    initializeArray();
});
</script>

<template>
    <div class="grid w-full items-start gap-1.5">
        <Label
            v-if="title"
            :for="id"
        >
            {{ title }}
            <span
                v-if="required"
                class="text-destructive font-semibold"
            >*</span>
        </Label>

        <div class="space-y-2">
            <!-- Empty state message -->
            <div
                v-if="normalizedArray.length === 0 && emptyMessage"
                class="text-sm text-muted-foreground py-2"
            >
                {{ emptyMessage }}
            </div>

            <!-- Array items -->
            <div
                v-for="(item, index) in normalizedArray"
                :key="index"
                class="flex items-center gap-2"
            >
                <FormItemInput
                    :id="`${itemIdPrefix}-${index}`"
                    :model-value="item"
                    :placeholder="placeholder"
                    class="flex-1"
                    :disabled="disabled"
                    :readonly="readonly"
                    :errors="getItemError(index)"
                    @update:model-value="(val: string | null) => updateItem(index, val)"
                />
                <Button
                    v-if="canRemoveItem(index)"
                    type="button"
                    variant="destructive-outline"
                    size="icon"
                    :disabled="disabled || readonly"
                    :aria-label="`Remove item ${index + 1}`"
                    @click="removeItem(index)"
                >
                    <Icon
                        name="solar:trash-bin-minimalistic-outline"
                        class="!size-4 shrink-0"
                    />
                </Button>
            </div>

            <!-- Add button -->
            <Button
                v-if="canAdd"
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled || readonly"
                @click="addItem"
            >
                <Icon
                    name="solar:add-circle-outline"
                    class="mr-2 h-4 w-4"
                />
                {{ addButtonText }}
            </Button>

            <!-- Max items reached message -->
            <div
                v-if="maxItems > 0 && normalizedArray.length >= maxItems"
                class="text-xs text-muted-foreground"
            >
                Maximum {{ maxItems }} item(s) allowed
            </div>
        </div>

        <!-- Global errors -->
        <div
            v-if="hasErrors && normalizedArray.length === 0"
            class="text-sm text-destructive"
        >
            <p
                v-for="(error, index) in errors"
                :key="index"
            >
                {{ error }}
            </p>
        </div>
    </div>
</template>

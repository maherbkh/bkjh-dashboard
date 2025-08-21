<script setup lang="ts">
import { cn } from '@/lib/utils';

type DataItem = {
    [key: string]: any;
};

type Props = {
    data?: DataItem[];
    modelValue?: any[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    label?: string;
    keyValue: string;
    nameValue: string;
    imgValue?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    errors?: string[];
    readonly?: boolean;
    title?: string;
    id?: string;
    icon?: string;
};

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    readonly: false,
    required: false,
    errors: () => [],
    data: () => [],
    imgValue: undefined,
    searchPlaceholder: 'Search...',
    emptyText: 'No items found',
    modelValue: () => [],
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: any[]): void;
}>();

const selectedItems = computed<any[]>({
    get: () => props.modelValue ?? [],
    set: val => emit('update:modelValue', val),
});

const searchTerm = ref('');
const isOpen = ref(false);

// Get selected items with their full data
const selectedItemsData = computed(() => {
    return selectedItems.value.map((selectedValue) => {
        const item = props.data.find(dataItem => dataItem[props.keyValue] === selectedValue);
        return item || { [props.keyValue]: selectedValue, [props.nameValue]: selectedValue };
    });
});

// Filter available items (exclude already selected)
const filteredItems = computed(() => {
    const selectedKeys = selectedItems.value;
    return props.data.filter((item) => {
        const matchesSearch = item[props.nameValue]?.toLowerCase().includes(searchTerm.value.toLowerCase());
        const notSelected = !selectedKeys.includes(item[props.keyValue]);
        return matchesSearch && notSelected;
    });
});

const addItem = (item: DataItem) => {
    const newValue = [...selectedItems.value, item[props.keyValue]];
    selectedItems.value = newValue;
    searchTerm.value = '';
    isOpen.value = false;
};

const removeItem = (itemToRemove: any) => {
    const newValue = selectedItems.value.filter(item => item !== itemToRemove);
    selectedItems.value = newValue;
};

const handleInputKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace' && searchTerm.value === '' && selectedItems.value.length > 0) {
        // Remove last item when backspace is pressed on empty input
        const newValue = [...selectedItems.value];
        newValue.pop();
        selectedItems.value = newValue;
    }
};
</script>

<template>
    <div class="grid w-full items-center gap-1.5">
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

        <div class="relative w-full">
            <Combobox
                v-model:open="isOpen"
                v-model:search-term="searchTerm"
            >
                <ComboboxAnchor as-child>
                    <TagsInput
                        :id="id"
                        :model-value="selectedItemsData.map((item: DataItem) => item[nameValue])"
                        :class="cn(
                            'min-h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                            (icon && 'pl-8'),
                            errors.length > 0 && 'border-destructive focus-within:ring-destructive',
                        )"
                        :disabled="disabled"
                        :readonly="readonly"
                        :aria-invalid="errors.length > 0"
                    >
                        <div class="flex flex-wrap gap-1">
                            <TagsInputItem
                                v-for="item in selectedItemsData"
                                :key="item[keyValue]"
                                :value="item[nameValue]"
                                class="flex items-center gap-1"
                            >
                                <img
                                    v-if="imgValue && item[imgValue]"
                                    :src="item[imgValue]"
                                    :alt="item[nameValue]"
                                    class="w-4 h-4 rounded-full object-cover"
                                >
                                <TagsInputItemText />
                                <TagsInputItemDelete
                                    v-if="!disabled && !readonly"
                                    @click="removeItem(item[keyValue])"
                                />
                            </TagsInputItem>
                        </div>

                        <ComboboxInput
                            v-if="!disabled && !readonly"
                            :placeholder="selectedItems.length === 0 ? placeholder : ''"
                            class="flex-1 bg-transparent border-0 outline-none focus:ring-0 px-0"
                            @keydown="handleInputKeydown"
                        />
                    </TagsInput>
                </ComboboxAnchor>

                <span
                    v-if="icon"
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2 pointer-events-none z-10"
                >
                    <Icon
                        :name="icon"
                        class="size-4 text-muted-foreground"
                    />
                </span>

                <ComboboxList
                    v-if="!disabled && !readonly"
                    class="mt-1 max-h-60 overflow-auto border rounded-md bg-popover p-1 shadow-md"
                >
                    <ComboboxViewport>
                        <ComboboxEmpty class="py-2 px-3 text-sm text-muted-foreground">
                            {{ emptyText }}
                        </ComboboxEmpty>

                        <ComboboxItem
                            v-for="item in filteredItems"
                            :key="item[keyValue]"
                            :value="item[nameValue]"
                            class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                            @select="addItem(item)"
                        >
                            <img
                                v-if="imgValue && item[imgValue]"
                                :src="item[imgValue]"
                                :alt="item[nameValue]"
                                class="w-4 h-4 rounded-full object-cover"
                            >
                            <span>{{ item[nameValue] }}</span>
                        </ComboboxItem>
                    </ComboboxViewport>
                </ComboboxList>
            </Combobox>
        </div>

        <div
            v-if="errors.length"
            class="text-destructive text-xs mt-0.5"
        >
            <div
                v-for="(err, i) in errors"
                :key="i"
                :class="[(icon && 'pl-8')]"
            >
                - {{ err }}
            </div>
        </div>
    </div>
</template>

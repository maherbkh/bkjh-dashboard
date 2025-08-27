<script setup lang="ts">
import { cn } from '@/lib/utils';

const { t } = useI18n();

type SelectOption = {
    [key: string]: any;
};

type Props = {
    id?: string;
    modelValue?: any;
    title?: string;
    placeholder?: string;
    errors?: string[];
    required?: boolean;
    disabled?: boolean;
    class?: string;
    data?: SelectOption[];
    keyValue?: string;
    nameValue?: string;
    emptyText?: string;
};

const props = withDefaults(defineProps<Props>(), {
    id: '',
    modelValue: null,
    title: '',
    placeholder: '',
    errors: () => [],
    required: false,
    disabled: false,
    class: '',
    data: () => [],
    keyValue: 'id',
    nameValue: 'name',
    emptyText: 'No options available',
});

const emit = defineEmits<{
    'update:modelValue': [value: string | number | null];
}>();

const hasErrors = computed(() => props.errors && props.errors.length > 0);

const handleValueChange = (value: string) => {
    // Convert to number if the original value was a number
    const numValue = Number(value);
    const finalValue = !isNaN(numValue) && value !== '' ? numValue : value;
    emit('update:modelValue', finalValue);
};

const open = ref(false);

const selectedValue = computed(() => {
    return props.modelValue?.toString() || '';
});

const selectedItem = computed(() => {
    if (!props.modelValue) return null;
    return props.data.find(item => item[props.keyValue].toString() === selectedValue.value);
});

const handleSelect = (value: string) => {
    handleValueChange(value);
    open.value = false;
};
</script>

<template>
    <div :class="cn('grid w-full items-center gap-2', props.class)">
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

        <Popover v-model:open="open">
            <PopoverTrigger as-child>
                <Button
                    :id="id"
                    variant="outline"
                    role="combobox"
                    :aria-expanded="open"
                    :disabled="disabled"
                    :class="cn(
                        'w-full justify-between !bg-background font-normal h-8',
                        hasErrors && '!border-destructive !focus:ring-destructive',
                        !selectedItem && 'text-muted-foreground',
                    )"
                >
                    {{ selectedItem ? selectedItem[nameValue] : placeholder }}
                    <Icon
                        name="solar:alt-arrow-down-bold"
                        class="ml-2 h-4 w-4 shrink-0 opacity-50"
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                class="w-full p-0"
                align="start"
            >
                <Command v-model="selectedValue">
                    <CommandInput :placeholder="t('action.search_placeholder')" />
                    <CommandEmpty v-if="data.length === 0">
                        {{ emptyText }}
                    </CommandEmpty>
                    <CommandEmpty v-else>
                        {{ t('global.messages.no_search_results') }}
                    </CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                v-for="item in data"
                                :key="item[keyValue]"
                                :value="item[keyValue].toString()"
                                @select="() => handleSelect(item[keyValue].toString())"
                            >
                                <Icon
                                    name="solar:check-bold"
                                    :class="cn(
                                        'mr-2 h-4 w-4',
                                        selectedValue === item[keyValue].toString() ? 'opacity-100' : 'opacity-0',
                                    )"
                                />
                                {{ item[nameValue] }}
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>

        <div
            v-if="errors.length"
            class="text-destructive text-xs mt-0.5"
        >
            <div
                v-for="(err, i) in errors"
                :key="i"
            >
                - {{ err }}
            </div>
        </div>
    </div>
</template>

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
    searchable?: boolean;
    disabledKey?: string;
    castToNumber?: boolean;
    /** When true, show a control to clear the selection (emits empty string, or null when castToNumber). */
    clearable?: boolean;
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
    emptyText: undefined,
    searchable: true,
    disabledKey: 'disabled',
    castToNumber: false,
    clearable: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string | number | null];
}>();

const hasErrors = computed(() => props.errors && props.errors.length > 0);

const handleValueChange = (value: string) => {
    const finalValue = props.castToNumber && value !== '' && !Number.isNaN(Number(value))
        ? Number(value)
        : value;
    emit('update:modelValue', finalValue);
};

const open = ref(false);

const selectedValue = computed(() => {
    return props.modelValue?.toString() || '';
});

const selectedItem = computed(() => {
    if (!props.modelValue) return null;
    return props.data.find(item => (item[props.keyValue]?.toString() ?? '') === selectedValue.value);
});

const handleSelect = (value: string) => {
    handleValueChange(value);
    open.value = false;
};

const stopClearTriggerPropagation = (event: Event) => {
    event.stopPropagation();
};

const handleClear = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    open.value = false;
    const empty = props.castToNumber ? null : '';
    emit('update:modelValue', empty as string | number | null);
};

const isItemDisabled = (item: SelectOption) => Boolean(item?.[props.disabledKey]);
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
                        'relative w-full min-w-0 justify-between gap-2 bg-background! font-normal h-8 text-base md:text-sm',
                        hasErrors && 'border-destructive! focus:ring-destructive!',
                        !selectedItem && 'text-muted-foreground',
                    )"
                >
                    <span class="truncate min-w-0 flex-1 text-left">{{ selectedItem ? selectedItem[nameValue] : placeholder }}</span>
                    <span class="flex shrink-0 items-center gap-0.5">
                        <span
                            v-if="props.clearable && selectedItem && !disabled"
                            role="button"
                            tabindex="0"
                            class="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            :aria-label="t('media.clear_selection')"
                            @pointerdown.stop="stopClearTriggerPropagation"
                            @click.stop.prevent="handleClear"
                            @keydown.enter.prevent.stop="handleClear"
                            @keydown.space.prevent.stop="handleClear"
                        >
                            <Icon
                                name="solar:close-circle-line-duotone"
                                class="size-4 shrink-0"
                            />
                        </span>
                        <Icon
                            name="solar:double-alt-arrow-down-line-duotone"
                            class="h-4 w-4 shrink-0 opacity-50"
                        />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                class="w-full p-0 rounded-md"
                align="start"
            >
                <Command v-model="selectedValue">
                    <CommandInput
                        v-if="props.searchable"
                        :placeholder="t('action.search_placeholder')"
                    />
                    <CommandEmpty v-if="props.data.length === 0">
                        {{ emptyText ?? t('form.no_options_available') }}
                    </CommandEmpty>
                    <CommandEmpty v-else>
                        {{ t('global.messages.no_search_results') }}
                    </CommandEmpty>
                    <CommandList class="space-y-2">
                        <CommandGroup>
                            <CommandItem
                                v-for="item in props.data"
                                :key="item[keyValue]"
                                :disabled="isItemDisabled(item)"
                                class="my-1"
                                :class="[
                                    isItemDisabled(item)
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                                    selectedValue === (item[keyValue]?.toString() ?? '') ? 'bg-accent text-accent-foreground' : '',
                                ]"
                                :value="item[keyValue]?.toString() ?? ''"
                                @select="() => !isItemDisabled(item) && handleSelect(item[keyValue]?.toString() ?? '')"
                            >
                                <Icon
                                    name="solar:check-circle-line-duotone"
                                    :class="cn(
                                        'mr-2 size-4! shrink-0 text-success',
                                        selectedValue === (item[keyValue]?.toString() ?? '') ? 'opacity-100' : 'opacity-0',
                                    )"
                                />
                                <span
                                    :class="selectedValue === (item[keyValue]?.toString() ?? '') ? 'font-semibold' : ''"
                                    class="line-clamp-1"
                                >{{ item[nameValue] }}</span>
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

<script setup lang="ts">
type Primitive = string | number;
export type MultiSelectOption<T extends Primitive = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue: Primitive[];
    data: any[];
    itemKey?: string;
    itemLabel?: string;
    itemDisabled?: string;

    id?: string;
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    hint?: string;

    disabled?: boolean;
    max?: number;
    clearable?: boolean;
    selectAll?: boolean;
    required?: boolean;
    closeOnSelect?: boolean;

    singleLine?: boolean;
    autoSize?: boolean;
    contentClass?: string;

    maxCount?: number;
    responsiveMaxCount?: Partial<{ mobile: number; tablet: number; desktop: number }>;

    buttonText?: (count: number) => string;
    searchDebounce?: number;
  }>(),
  {
    itemKey: "id",
    itemLabel: "name",
    itemDisabled: "disabled",
    placeholder: "Select…",
    searchPlaceholder: "Search…",
    emptyText: "No results found",
    disabled: false,
    max: 0,
    clearable: true,
    selectAll: false,
    required: false,
    closeOnSelect: false,
    singleLine: false,
    autoSize: false,
    contentClass: "w-[320px] p-0",
    maxCount: 4,
    responsiveMaxCount: undefined,
    buttonText: (count: number) => (count > 0 ? `${count} selected` : "Select…"),
    searchDebounce: 120,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue" | "change", value: Primitive[]): void;
  (e: "open-change", value: boolean): void;
}>();

const open = ref(false);
const search = ref("");
const debouncedSearch = ref("");
let searchTimer: number | undefined;
watch(search, (v) => {
  clearTimeout(searchTimer);
  // @ts-expect-error window typing not strict
  searchTimer = window.setTimeout(
    () => (debouncedSearch.value = v),
    props.searchDebounce
  );
});

// Memoize normalizedOptions to prevent unnecessary recalculations
const normalizedOptions = computed<MultiSelectOption[]>(() => {
  const arr = props.data;
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const key = props.itemKey!;
  const lab = props.itemLabel!;
  const dis = props.itemDisabled!;

  // Early return for empty data
  if (arr.length === 0) return [];

  return arr.map((item: any) => ({
    value: String(item?.[key] ?? ""),
    label: String(item?.[lab] ?? ""),
    disabled: Boolean(item?.[dis]),
  }));
});

// Optimize optionByValue with early returns
const optionByValue = computed<Record<string, MultiSelectOption>>(() => {
  const options = normalizedOptions.value;
  if (options.length === 0) return {};

  const map: Record<string, MultiSelectOption> = {};
  for (const o of options) {
    map[String(o.value)] = o;
  }
  return map;
});

const model = computed<string[]>({
  get: () => {
    const modelValue = props.modelValue ?? [];
    // Handle both UUID arrays and object arrays
    return modelValue.map((v) => {
      if (typeof v === "object" && v !== null && "id" in v) {
        return String(v.id);
      }
      return String(v);
    });
  },
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});

// Optimize selectedOptions with early returns
const selectedOptions = computed(() => {
  const modelValues = model.value;
  if (modelValues.length === 0) return [];

  const optionMap = optionByValue.value;
  return modelValues.map((v) => optionMap[v]).filter(Boolean);
});

const filterFn = (o: MultiSelectOption, q: string) => o.label.toLowerCase().includes(q);

// Optimize filtered with early returns
const filtered = computed<MultiSelectOption[]>(() => {
  const options = normalizedOptions.value;
  if (options.length === 0) return [];

  const q = debouncedSearch.value.trim().toLowerCase();
  if (!q) return options;

  return options.filter((o) => filterFn(o, q));
});

// Optimize isSelected with Set for O(1) lookup instead of O(n)
const selectedValuesSet = computed(() => new Set(model.value));
const isSelected = (v: Primitive) => selectedValuesSet.value.has(String(v));

function toggleValue(v: Primitive, force?: boolean) {
  const val = String(v);
  const currently = isSelected(val);
  const shouldSelect = force !== undefined ? force : !currently;

  if (shouldSelect && !currently) {
    if (props.max > 0 && model.value.length >= props.max) return;
    model.value = [...model.value, val];
  } else if (!shouldSelect && currently) {
    model.value = model.value.filter((x) => x !== val);
  }

  if (props.closeOnSelect) open.value = false;
}

function clear() {
  model.value = [];
}

// Optimize filteredEnabledValues with early returns
const filteredEnabledValues = computed(() => {
  const filteredOptions = filtered.value;
  if (filteredOptions.length === 0) return [];

  return filteredOptions.filter((o) => !o.disabled).map((o) => String(o.value));
});
const isAllSelected = computed(
  () =>
    filteredEnabledValues.value.length > 0 &&
    filteredEnabledValues.value.every((v) => isSelected(v))
);

function toggleSelectAll(force?: boolean) {
  if (!props.selectAll) return;
  const pool = filteredEnabledValues.value;
  const shouldSelect = force !== undefined ? force : !isAllSelected.value;

  if (shouldSelect) {
    const existing = new Set(model.value);
    const toAdd: string[] = [];
    for (const v of pool) {
      if (props.max > 0 && existing.size + toAdd.length >= props.max) break;
      if (!existing.has(v)) toAdd.push(v);
    }
    model.value = [...model.value, ...toAdd];
  } else {
    const remove = new Set(pool);
    model.value = model.value.filter((v) => !remove.has(v));
  }
}

const triggerRef = ref<HTMLElement | null>(null);
const contentStyle = ref<string>("");
function updateWidth() {
  if (triggerRef.value && !props.autoSize)
    contentStyle.value = `--trigger-width:${triggerRef.value.offsetWidth}px;`;
}

// Combine all event listeners into single onMounted/onBeforeUnmount
const viewport = ref<"mobile" | "tablet" | "desktop">("desktop");

function updateViewport() {
  const w = window.innerWidth;
  viewport.value = w <= 768 ? "mobile" : w <= 1024 ? "tablet" : "desktop";
}

function handleResize() {
  updateWidth();
  updateViewport();
}

onMounted(() => {
  updateWidth();
  updateViewport();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const effectiveMaxCount = computed(() => {
  const r = props.responsiveMaxCount;
  if (!r) return props.maxCount;
  const byVp = r[viewport.value];
  return typeof byVp === "number" ? byVp : props.maxCount;
});

const buttonText = computed(() => props.buttonText(model.value.length));

function focus() {
  triggerRef.value?.focus();
}
function openMenu() {
  open.value = true;
}
function closeMenu() {
  open.value = false;
}
function setValues(vals: Primitive[]) {
  model.value = vals.map((v) => String(v));
}
function getValues() {
  return [...model.value];
}

defineExpose({ focus, open: openMenu, close: closeMenu, clear, setValues, getValues });
</script>

<template>
  <div class="w-full" :class="singleLine ? 'space-y-1' : ''">
    <label v-if="label" :for="id" class="mb-2 block text-sm font-medium">
      {{ label }}<span v-if="required" class="text-destructive"> *</span>
    </label>

    <div
      v-if="selectedOptions.length"
      class="mb-2 flex gap-2"
      :class="singleLine ? 'overflow-x-auto whitespace-nowrap no-scrollbar' : 'flex-wrap'"
    >
      <template v-for="(opt, idx) in selectedOptions" :key="opt.value">
        <Badge v-if="idx < effectiveMaxCount" class="gap-1 mr-1">
          <span class="truncate max-w-[12rem]">{{ opt.label }}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-4 w-4 p-0"
            @click.stop="toggleValue(opt.value, false)"
            >×</Button
          >
        </Badge>
      </template>
      <Badge v-if="selectedOptions.length > effectiveMaxCount" variant="secondary"
        >+{{ selectedOptions.length - effectiveMaxCount }}</Badge
      >
    </div>

    <Popover v-model:open="open" @update:open="(v:boolean)=>emit('open-change', v)">
      <PopoverTrigger as-child>
        <Button
          :id="id"
          ref="triggerRef"
          type="button"
          variant="outline"
          :disabled="disabled"
          class="justify-between"
          :class="autoSize ? 'w-auto' : 'w-full'"
          aria-haspopup="listbox"
          :aria-expanded="open"
        >
          <span class="truncate">{{ buttonText }}</span>
          <span aria-hidden>▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        :style="contentStyle"
        :class="[contentClass, autoSize ? '' : 'popover-content']"
      >
        <Command>
          <div class="flex items-center gap-2 p-2 border-b">
            <div class="relative flex-1">
              <CommandInput
                v-model="search"
                :placeholder="searchPlaceholder"
                class="pl-0"
              />
            </div>
            <Button
              v-if="clearable && model.length"
              variant="ghost"
              size="sm"
              type="button"
              class="gap-2"
              @click="clear"
              >Clear</Button
            >
          </div>

          <CommandEmpty class="p-3 text-sm text-muted-foreground">{{
            emptyText
          }}</CommandEmpty>

          <ScrollArea
            class="max-h-60 overflow-auto no-scrollbar-arrows scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900"
          >
            <CommandList>
              <CommandGroup>
                <!-- Select all -->
                <CommandItem
                  v-if="selectAll"
                  value="__select_all__"
                  class="gap-2"
                  @click="toggleSelectAll()"
                >
                  <Checkbox
                    :checked="isAllSelected"
                    @update:checked="(nv:boolean)=>toggleSelectAll(nv)"
                    class="mr-2"
                  />
                  <span>{{ isAllSelected ? "Unselect all" : "Select all" }}</span>
                </CommandItem>

                <!-- Options -->
                <CommandItem
                  v-for="o in filtered"
                  :key="o.value"
                  :value="o.label"
                  :disabled="o.disabled"
                  class="cursor-pointer"
                  @click="toggleValue(o.value)"
                >
                  <Checkbox
                    :checked="isSelected(o.value)"
                    @update:checked="(nv:boolean)=>toggleValue(o.value, nv)"
                    class="mr-2"
                    :disabled="o.disabled"
                  />
                  <span :class="o.disabled ? 'opacity-50' : ''">{{ o.label }}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>

    <p v-if="hint" class="mt-2 text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.popover-content {
  width: var(--trigger-width, 20rem);
}
</style>

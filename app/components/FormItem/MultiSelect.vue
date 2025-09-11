<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, defineExpose } from "vue";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Nuxt 4 + shadcn-vue + Tailwind v4
 */

type Primitive = string | number;
export type MultiSelectOption<T extends Primitive = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    /** v-model for selected values */
    modelValue: Primitive[];
    /** Data array - any shape; keys map fields */
    data: any[];
    itemKey?: string;
    itemLabel?: string;
    itemDisabled?: string;

    /** UI */
    id?: string;
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    hint?: string;

    /** Behavior */
    disabled?: boolean;
    max?: number; // 0 = unlimited
    clearable?: boolean;
    selectAll?: boolean;
    required?: boolean; // visual only
    closeOnSelect?: boolean;

    /** Layout */
    singleLine?: boolean;
    autoSize?: boolean;
    contentClass?: string;

    /** Badges */
    maxCount?: number; // visible badges before +N
    responsiveMaxCount?: Partial<{ mobile: number; tablet: number; desktop: number }>;

    /** Custom button text formatter */
    buttonText?: (count: number) => string;

    /** Debounce ms for search */
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

// Normalize -> flat list of options
const normalizedOptions = computed<MultiSelectOption[]>(() => {
  const arr = props.data ?? [];
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const key = props.itemKey!;
  const lab = props.itemLabel!;
  const dis = props.itemDisabled!;
  return arr.map((item: any) => ({
    value: item?.[key],
    label: String(item?.[lab] ?? ""),
    disabled: Boolean(item?.[dis]),
  }));
});

const optionByValue = computed<Record<string, MultiSelectOption>>(() => {
  const map: Record<string, MultiSelectOption> = {};
  for (const o of normalizedOptions.value) map[String(o.value)] = o;
  return map;
});

const model = computed<Primitive[]>({
  get: () => props.modelValue ?? [],
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});

const selectedOptions = computed(() =>
  model.value.map((v) => optionByValue.value[String(v)]).filter(Boolean)
);
const filterFn = (o: MultiSelectOption, q: string) => o.label.toLowerCase().includes(q);

const filtered = computed<MultiSelectOption[]>(() => {
  const q = debouncedSearch.value.trim().toLowerCase();
  if (!q) return normalizedOptions.value;
  return normalizedOptions.value.filter((o) => filterFn(o, q));
});

const isSelected = (v: Primitive) => model.value.some((x) => String(x) === String(v));

function toggleValue(v: Primitive) {
  if (isSelected(v)) {
    model.value = model.value.filter((x) => String(x) !== String(v));
  } else {
    if (props.max > 0 && model.value.length >= props.max) return;
    model.value = [...model.value, v];
  }
  if (props.closeOnSelect) open.value = false;
}

function clear() {
  model.value = [];
}

const filteredEnabledValues = computed(() =>
  filtered.value.filter((o) => !o.disabled).map((o) => o.value)
);
const isAllSelected = computed(
  () =>
    filteredEnabledValues.value.length > 0 &&
    filteredEnabledValues.value.every((v) => isSelected(v))
);

function toggleSelectAll() {
  if (!props.selectAll) return;
  const pool = filteredEnabledValues.value;
  if (isAllSelected.value) {
    const remove = new Set(pool.map((v) => String(v)));
    model.value = model.value.filter((v) => !remove.has(String(v)));
  } else {
    const existing = new Set(model.value.map((v) => String(v)));
    const toAdd: Primitive[] = [];
    for (const v of pool) {
      if (props.max > 0 && existing.size + toAdd.length >= props.max) break;
      if (!existing.has(String(v))) toAdd.push(v);
    }
    model.value = [...model.value, ...toAdd];
  }
}

// Width sync for content
const triggerRef = ref<HTMLElement | null>(null);
const contentStyle = ref<string>("");
function updateWidth() {
  if (triggerRef.value && !props.autoSize)
    contentStyle.value = `--trigger-width:${triggerRef.value.offsetWidth}px;`;
}

onMounted(() => {
  updateWidth();
  window.addEventListener("resize", updateWidth);
});

onBeforeUnmount(() => window.removeEventListener("resize", updateWidth));

// Responsive maxCount
const viewport = ref<"mobile" | "tablet" | "desktop">("desktop");
function updateViewport() {
  const w = window.innerWidth;
  viewport.value = w <= 768 ? "mobile" : w <= 1024 ? "tablet" : "desktop";
}

onMounted(() => {
  updateViewport();
  window.addEventListener("resize", updateViewport);
});

onBeforeUnmount(() => window.removeEventListener("resize", updateViewport));

const effectiveMaxCount = computed(() => {
  const r = props.responsiveMaxCount;
  if (!r) return props.maxCount;
  const byVp = r[viewport.value];
  return typeof byVp === "number" ? byVp : props.maxCount;
});

const buttonText = computed(() => props.buttonText(model.value.length));

// Programmatic API
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
  model.value = [...vals];
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

    <!-- Selected badges -->
    <div
      v-if="selectedOptions.length"
      class="mb-2 flex gap-2"
      :class="singleLine ? 'overflow-x-auto whitespace-nowrap no-scrollbar' : 'flex-wrap'"
    >
      <template v-for="(opt, idx) in selectedOptions" :key="String(opt.value)">
        <Badge v-if="idx < effectiveMaxCount" class="gap-1 mr-1">
          <span class="truncate max-w-[12rem]">{{ opt.label }}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-4 w-4 p-0"
            @click.stop="toggleValue(opt.value)"
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

          <ScrollArea class="max-h-60">
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-if="selectAll"
                  value="__select_all__"
                  class="gap-2"
                  @select="toggleSelectAll"
                >
                  <Checkbox :checked="isAllSelected" class="mr-2" />
                  <span>{{ isAllSelected ? "Unselect all" : "Select all" }}</span>
                </CommandItem>

                <CommandItem
                  v-for="o in filtered"
                  :key="String(o.value)"
                  :value="o.label"
                  :disabled="o.disabled"
                  class="cursor-pointer"
                  @select="toggleValue(o.value)"
                >
                  <Checkbox
                    :checked="isSelected(o.value)"
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

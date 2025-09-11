<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";

import { ListboxFilter, useForwardProps } from "reka-ui";
import type { ListboxFilterProps } from "reka-ui";
import { useCommand } from ".";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  ListboxFilterProps & {
    class?: HTMLAttributes["class"];
  }
>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);

const { filterState } = useCommand();
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="flex h-12 items-center gap-2 px-3 !bg-mutted rounded-full"
  >
    <Icon name="solar:magnifer-linear" class="size-4 shrink-0 opacity-50" />
    <ListboxFilter
      v-bind="{ ...forwardedProps, ...$attrs }"
      v-model="filterState.search"
      data-slot="command-input"
      auto-focus
      :class="
        cn(
          'placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          props.class
        )
      "
    />
  </div>
</template>

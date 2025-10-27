<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';

import {
    DropdownMenuItemIndicator,
    DropdownMenuRadioItem,

    useForwardPropsEmits,
} from 'reka-ui';
import type { DropdownMenuRadioItemEmits, DropdownMenuRadioItemProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes['class'] }>();

const emits = defineEmits<DropdownMenuRadioItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <DropdownMenuRadioItem
        data-slot="dropdown-menu-radio-item"
        v-bind="forwarded"
        :class="cn(
            `focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
            props.class,
        )"
    >
        <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            <DropdownMenuItemIndicator>
                <Icon
                    name="solar:check-circle-line-duotone"
                    class="!size-4 shrink-0 mt-0.75 group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300"
                />
            </DropdownMenuItemIndicator>
        </span>
        <slot />
    </DropdownMenuRadioItem>
</template>

<template>
    <div :class="containerClass">
        <!-- Header Section -->
        <div
            v-if="title || titleIcon"
            class="flex items-center gap-3 mb-2"
        >
            <Icon
                v-if="titleIcon"
                :name="titleIcon"
                :class="cn(titleIconClass, '!size-5 shrink-0')"
            />
            <div
                v-if="title"
                :class="titleClass"
            >
                {{ title }}
            </div>
        </div>

        <!-- Value Section -->
        <div
            v-if="value !== undefined"
            class="flex items-baseline gap-3 mb-1"
        >
            <Icon
                v-if="valueIcon"
                :name="valueIcon"
                :class="cn(valueIconClass, '!size-5 shrink-0')"
            />
            <div :class="valueClass">
                {{ formatValue(value, valueFormatter) }}
            </div>
            <div
                v-if="valueSuffix"
                :class="valueSuffixClass"
            >
                {{ valueSuffix }}
            </div>
        </div>

        <!-- Subtitle Section -->
        <div
            v-if="subtitle"
            :class="subtitleClass"
        >
            {{ subtitle }}
        </div>

        <!-- Items List -->
        <ul
            v-if="items && items.length > 0"
            :class="itemsListClass"
        >
            <li
                v-for="(item, index) in items"
                :key="index"
                :class="itemClass"
            >
                <div class="flex items-center gap-3">
                    <Icon
                        v-if="item.icon"
                        :name="item.icon"
                        :class="cn(itemIconClass, '!size-5 shrink-0')"
                    />
                    <div :class="itemNameClass">
                        {{ item.name }}
                    </div>
                </div>
                <div :class="itemValueClass">
                    {{ formatValue(item.value, item.valueFormatter) }}
                </div>
            </li>
        </ul>

        <!-- Trend Section -->
        <div
            v-if="trend || trendText"
            class="mt-2 flex items-center gap-3"
            :class="trendClass"
        >
            <Icon
                v-if="trendIcon || trend"
                :name="trendIcon || getTrendIcon(trend)"
                :class="cn(trendIconClass, '!size-5 shrink-0')"
            />
            <span
                v-if="trendText"
                :class="trendTextClass"
            >
                {{ trendText }}
            </span>
        </div>

        <!-- Action Slot -->
        <div
            v-if="$slots.actions"
            class="mt-3"
        >
            <slot name="actions" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '~/lib/utils';

export interface StateBoxItem {
    /** Item label/name */
    name: string;
    /** Item value */
    value: number | string;
    /** Optional icon for the item (e.g., 'solar:chart-bold') */
    icon?: string;
    /** Optional custom formatter for this item's value */
    valueFormatter?: (val: number | string) => string;
}

interface Props {
    /** Main title text */
    title?: string;
    /** Icon for the title (e.g., 'solar:chart-bold') */
    titleIcon?: string;
    /** Main value to display */
    value?: number | string;
    /** Icon for the value */
    valueIcon?: string;
    /** Suffix text after value (e.g., '%', 'k', 'M') */
    valueSuffix?: string;
    /** Subtitle text below value */
    subtitle?: string;
    /** Array of items to display in list */
    items?: StateBoxItem[];
    /** Trend direction */
    trend?: 'up' | 'down' | 'neutral';
    /** Custom trend icon (overrides default trend icons) */
    trendIcon?: string;
    /** Trend text to display */
    trendText?: string;
    /** Custom value formatter function */
    valueFormatter?: (val: number | string) => string;
    /** Custom container class */
    containerClass?: string;
    /** Variant style: 'default' | 'bordered' | 'filled' | 'outlined' */
    variant?: 'default' | 'bordered' | 'filled' | 'outlined';
    /** Size: 'sm' | 'md' | 'lg' */
    size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    variant: 'default',
    size: 'md',
    containerClass: '',
    valueFormatter: undefined,
});

// Size-based classes
const sizeClasses = {
    sm: {
        padding: 'px-3 py-2',
        title: 'text-xs',
        value: 'text-xl',
        subtitle: 'text-xs',
        item: 'text-xs',
        icon: 'size-3.5',
    },
    md: {
        padding: 'px-4 py-3',
        title: 'text-sm',
        value: 'text-2xl',
        subtitle: 'text-xs',
        item: 'text-sm',
        icon: 'size-4',
    },
    lg: {
        padding: 'px-5 py-4',
        title: 'text-base',
        value: 'text-3xl',
        subtitle: 'text-sm',
        item: 'text-base',
        icon: 'size-5',
    },
};

const currentSize = computed(() => sizeClasses[props.size]);

// Variant-based classes
const variantClasses = computed(() => {
    const base = 'rounded-2xl border';
    switch (props.variant) {
        case 'bordered':
            return cn(base, 'bg-transparent border-border/50');
        case 'filled':
            return cn(base, 'bg-muted border-transparent');
        case 'outlined':
            return cn(base, 'bg-transparent border-2 border-border');
        default:
            return cn(base, 'bg-muted/50 border-border/50');
    }
});

const containerClass = computed(() => {
    return cn(
        variantClasses.value,
        currentSize.value.padding,
        'text-muted-foreground',
        props.containerClass,
    );
});

const titleClass = computed(() => cn('font-medium', currentSize.value.title));
const titleIconClass = computed(() => cn('text-muted-foreground', currentSize.value.icon));
const valueClass = computed(() => cn('font-bold', currentSize.value.value));
const valueIconClass = computed(() => cn('text-muted-foreground', currentSize.value.icon));
const valueSuffixClass = computed(() => cn('text-muted-foreground font-normal', currentSize.value.subtitle));
const subtitleClass = computed(() => cn('opacity-70', currentSize.value.subtitle));
const itemsListClass = computed(() => cn('space-y-1.5', currentSize.value.item));
const itemClass = computed(() => 'flex items-center gap-3 justify-between');
const itemNameClass = computed(() => 'font-light');
const itemValueClass = computed(() => 'font-medium');
const itemIconClass = computed(() => cn('text-muted-foreground', currentSize.value.icon));

const trendClass = computed(() => 'text-xs');
const trendIconClass = computed(() => {
    if (!props.trend && !props.trendIcon) return '';
    const trend = props.trend || 'neutral';
    return cn(
        currentSize.value.icon,
        {
            'text-success': trend === 'up',
            'text-destructive': trend === 'down',
            'text-muted-foreground': trend === 'neutral',
        },
    );
});
const trendTextClass = computed(() => {
    if (!props.trend) return '';
    const trend = props.trend;
    return cn({
        'text-success': trend === 'up',
        'text-destructive': trend === 'down',
        'text-muted-foreground': trend === 'neutral',
    });
});

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral'): string => {
    switch (trend) {
        case 'up':
            return 'solar:arrow-up-bold';
        case 'down':
            return 'solar:arrow-down-bold';
        default:
            return 'solar:minus-bold';
    }
};

const formatValue = (val: number | string | undefined, customFormatter?: (val: number | string) => string): string => {
    if (val === undefined || val === null) return '0';

    if (customFormatter) {
        return customFormatter(val);
    }

    if (props.valueFormatter) {
        return props.valueFormatter(val);
    }

    if (typeof val === 'number') {
        return val.toLocaleString();
    }

    return String(val);
};
</script>

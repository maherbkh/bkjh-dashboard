<script setup lang="ts">
interface Props {
    title?: string;
    icon?: string;
    value: string | number;
    variant?: 'default' | 'destructive';
    /** Denser padding and typography for overview strips (e.g. attendee detail). */
    compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Box Title',
    icon: 'solar:square-academic-cap-linear',
    variant: 'default',
    compact: false,
});

const containerClasses = computed(() => {
    const pad = props.compact ? 'px-3 py-2 rounded-xl' : 'px-5 py-4 rounded-2xl';
    if (props.variant === 'destructive') {
        return `bg-destructive/10 text-destructive border-destructive/50 border ${pad}`;
    }
    return `bg-muted/50 text-muted-foreground border border-border/50 ${pad}`;
});

const valueClasses = computed(() => {
    if (props.compact) {
        return props.variant === 'destructive'
            ? 'font-semibold text-lg tabular-nums mt-0.5 text-destructive'
            : 'font-semibold text-lg tabular-nums mt-0.5 text-foreground/85';
    }
    if (props.variant === 'destructive') {
        return 'font-semibold text-xl mt-2 text-destructive';
    }
    return 'font-semibold text-xl mt-2 text-foreground/85';
});
</script>

<template>
    <div>
        <div :class="containerClasses">
            <div
                :class="[
                    'flex items-center gap-2',
                    props.compact ? 'text-xs leading-tight' : 'text-sm',
                ]"
            >
                <Icon
                    v-if="props.icon"
                    :name="props.icon"
                    :class="props.compact ? 'size-4! shrink-0' : 'size-5! shrink-0'"
                    aria-hidden="true"
                />
                <span>{{ props.title }}</span>
            </div>

            <div :class="valueClasses">
                {{ props.value }}
            </div>
        </div>
    </div>
</template>

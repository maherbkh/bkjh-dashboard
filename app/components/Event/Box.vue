<script setup lang="ts">
interface Props {
    title?: string;
    icon?: string;
    value: string | number;
    variant?: 'default' | 'destructive';
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Box Title',
    icon: 'solar:square-academic-cap-linear',
    variant: 'default',
});

const containerClasses = computed(() => {
    if (props.variant === 'destructive') {
        return 'bg-destructive/10 text-destructive border-destructive/50 px-5 py-4 rounded-2xl border';
    }
    return 'bg-muted/50 text-muted-foreground px-5 py-4 rounded-2xl border border-border/50';
});

const valueClasses = computed(() => {
    if (props.variant === 'destructive') {
        return 'font-semibold text-xl mt-2 text-destructive';
    }
    return 'font-semibold text-xl mt-2 text-foreground/85';
});
</script>

<template>
    <div>
        <div :class="containerClasses">
            <div class="text-sm flex items-start gap-2">
                <Icon
                    v-if="props.icon"
                    :name="props.icon"
                    class="!size-5 shrink-0"
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

<script setup lang="ts">
interface Props {
    title?: string;
    icon?: string;
    value: string | number;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Box Title',
    icon: 'solar:square-academic-cap-linear',
});
</script>

<template>
    <div>
        <div class="bg-muted/50 text-muted-foreground px-5 py-4 rounded-2xl border border-border/50">
            <div class="text-sm flex items-start gap-2">
                <Icon
                    v-if="props.icon"
                    :name="props.icon"
                    class="!size-5 shrink-0"
                    aria-hidden="true"
                />
                <span>{{ props.title }}</span>
            </div>

            <div
                class="font-semibold text-xl mt-2 text-foreground/85"
            >
                {{ props.value }}
            </div>
        </div>
    </div>
</template>

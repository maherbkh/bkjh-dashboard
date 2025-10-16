<script setup lang="ts">
import { mediaFormatter } from '~/services/media';

interface Props {
    mimeType: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    class: '',
});

const iconName = computed(() => {
    return mediaFormatter.getFileIcon(props.mimeType);
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'w-4 h-4';
        case 'md':
            return 'w-6 h-6';
        case 'lg':
            return 'w-8 h-8';
        case 'xl':
            return 'w-12 h-12';
        default:
            return 'w-6 h-6';
    }
});
</script>

<template>
    <Icon
        :name="iconName"
        :class="[
            'text-muted-foreground',
            sizeClasses,
            props.class,
        ]"
    />
</template>

<script setup lang="ts">
interface Props {
    progress?: number; // 0-100
    status?: 'uploading' | 'processing' | 'complete' | 'error';
    filename?: string;
    speed?: number; // bytes per second
    remainingTime?: number; // seconds
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    progress: 0,
    status: 'uploading',
    filename: '',
    speed: 0,
    remainingTime: 0,
    class: '',
});

const { t } = useI18n();

const statusConfig = computed(() => {
    switch (props.status) {
        case 'uploading':
            return {
                icon: 'solar:upload-square-outline',
                text: t('media.uploading'),
                color: 'text-primary',
            };
        case 'processing':
            return {
                icon: 'solar:refresh-outline',
                text: t('media.processing'),
                color: 'text-orange-500',
            };
        case 'complete':
            return {
                icon: 'solar:check-circle-outline',
                text: t('media.upload_complete'),
                color: 'text-green-500',
            };
        case 'error':
            return {
                icon: 'solar:close-circle-outline',
                text: t('media.upload_error'),
                color: 'text-red-500',
            };
        default:
            return {
                icon: 'solar:upload-square-outline',
                text: t('media.uploading'),
                color: 'text-primary',
            };
    }
});

const formattedSpeed = computed(() => {
    if (props.speed === 0) return '';

    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(props.speed) / Math.log(k));
    const speed = props.speed / Math.pow(k, i);

    return `${speed.toFixed(1)} ${sizes[i]}`;
});

const formattedRemainingTime = computed(() => {
    if (props.remainingTime === 0) return '';

    const minutes = Math.floor(props.remainingTime / 60);
    const seconds = Math.floor(props.remainingTime % 60);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
});
</script>

<template>
    <div :class="['space-y-3', props.class]">
        <!-- Header -->
        <div class="flex items-center gap-3">
            <Icon
                :name="statusConfig.icon"
                :class="['w-5 h-5', statusConfig.color, { 'animate-spin': status === 'processing' }]"
            />
            <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">
                    {{ statusConfig.text }}
                </p>
                <p
                    v-if="filename"
                    class="text-xs text-muted-foreground truncate"
                >
                    {{ filename }}
                </p>
            </div>
            <div
                v-if="status === 'uploading'"
                class="text-xs text-muted-foreground"
            >
                {{ Math.round(progress) }}%
            </div>
        </div>

        <!-- Progress bar -->
        <div
            v-if="status === 'uploading' || status === 'processing'"
            class="space-y-2"
        >
            <Progress
                :value="progress"
                class="h-2"
            />

            <div
                v-if="formattedSpeed || formattedRemainingTime"
                class="flex justify-between text-xs text-muted-foreground"
            >
                <span v-if="formattedSpeed">{{ formattedSpeed }}</span>
                <span v-if="formattedRemainingTime">{{ t('media.remaining') }}: {{ formattedRemainingTime }}</span>
            </div>
        </div>

        <!-- Complete state -->
        <div
            v-if="status === 'complete'"
            class="flex items-center gap-2 text-green-600 dark:text-green-400"
        >
            <Icon
                name="solar:check-circle-outline"
                class="w-4 h-4"
            />
            <span class="text-sm font-medium">{{ t('media.upload_successful') }}</span>
        </div>

        <!-- Error state -->
        <div
            v-if="status === 'error'"
            class="flex items-center gap-2 text-red-600 dark:text-red-400"
        >
            <Icon
                name="solar:close-circle-outline"
                class="w-4 h-4"
            />
            <span class="text-sm font-medium">{{ t('media.upload_failed') }}</span>
        </div>
    </div>
</template>

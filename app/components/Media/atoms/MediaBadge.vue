<script setup lang="ts">
import type { AccessLevel } from '~/types/media/index';
import { AccessLevel as AccessLevelEnum } from '~/types/media/index';

interface Props {
    accessLevel: AccessLevel;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'secondary';
}

const props = withDefaults(defineProps<Props>(), {
    size: 'sm',
    variant: 'default',
});

const { t } = useI18n();

const badgeConfig = computed(() => {
    switch (props.accessLevel) {
        case AccessLevelEnum.PUBLIC:
            return {
                label: t('media.access_public'),
                class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: 'solar:globe-outline',
            };
        case AccessLevelEnum.SELF:
            return {
                label: t('media.access_self'),
                class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: 'solar:user-outline',
            };
        case AccessLevelEnum.SUPPORT:
            return {
                label: t('media.access_support'),
                class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                icon: 'solar:shield-outline',
            };
        case AccessLevelEnum.ACADEMY:
            return {
                label: t('media.access_academy'),
                class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                icon: 'solar:graduation-outline',
            };
        default:
            return {
                label: props.accessLevel,
                class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                icon: 'solar:file-outline',
            };
    }
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'px-2 py-1 text-xs';
        case 'md':
            return 'px-2.5 py-1.5 text-sm';
        case 'lg':
            return 'px-3 py-2 text-base';
        default:
            return 'px-2 py-1 text-xs';
    }
});

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'outline':
            return 'border border-current bg-transparent';
        case 'secondary':
            return 'bg-secondary text-secondary-foreground';
        default:
            return '';
    }
});
</script>

<template>
    <Badge
        :class="[
            'inline-flex items-center gap-1 font-medium rounded-full',
            badgeConfig.class,
            sizeClasses,
            variantClasses,
        ]"
    >
        <Icon
            :name="badgeConfig.icon"
            class="w-3 h-3"
        />
        {{ badgeConfig.label }}
    </Badge>
</template>

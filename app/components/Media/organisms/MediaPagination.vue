<script setup lang="ts">
import type { ApiMeta } from '~/types/media/index';

interface Props {
    pagination: ApiMeta | null;
    loading?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    class: '',
});

const emit = defineEmits<{
    'update:page': [page: number];
    'update:pageSize': [size: number];
}>();

const { t } = useI18n();

const pageSizeOptions = [10, 25, 50, 100];

const canGoPrevious = computed(() => {
    return props.pagination && props.pagination.page > 1;
});

const canGoNext = computed(() => {
    return props.pagination && props.pagination.page < props.pagination.totalPages;
});

const totalPages = computed(() => {
    return props.pagination?.totalPages || 0;
});

const currentPage = computed(() => {
    return props.pagination?.page || 1;
});

const pageSize = computed(() => {
    return props.pagination?.limit || 25;
});

const totalItems = computed(() => {
    return props.pagination?.total || 0;
});

const startItem = computed(() => {
    return props.pagination?.page ? (props.pagination.page - 1) * props.pagination.limit + 1 : 0;
});

const endItem = computed(() => {
    if (!props.pagination) return 0;
    return Math.min(props.pagination.page * props.pagination.limit, props.pagination.total);
});

const handlePrevious = () => {
    if (canGoPrevious.value) {
        emit('update:page', currentPage.value - 1);
    }
};

const handleNext = () => {
    if (canGoNext.value) {
        emit('update:page', currentPage.value + 1);
    }
};

const handlePageSizeChange = (newSize: number) => {
    emit('update:pageSize', newSize);
};

const handlePageInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const page = parseInt(target.value);

    if (page >= 1 && page <= totalPages.value) {
        emit('update:page', page);
    }
    else {
    // Reset to current page if invalid
        target.value = currentPage.value.toString();
    }
};
</script>

<template>
    <div
        v-if="pagination && totalPages > 1"
        :class="['flex flex-col sm:flex-row items-center justify-between gap-4', props.class]"
    >
        <!-- Results info -->
        <div class="text-sm text-muted-foreground">
            {{ t('common.showing') }} {{ startItem }} {{ t('common.to') }} {{ endItem }} {{ t('common.of') }} {{ totalItems }}
        </div>

        <!-- Pagination controls -->
        <div class="flex items-center gap-2">
            <!-- Page size selector -->
            <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">{{ t('common.show') }}:</span>
                <Select
                    :model-value="pageSize"
                    @update:model-value="handlePageSizeChange"
                >
                    <SelectTrigger class="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="size in pageSizeOptions"
                            :key="size"
                            :value="size"
                        >
                            {{ size }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Navigation buttons -->
            <div class="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    :disabled="!canGoPrevious || loading"
                    @click="handlePrevious"
                >
                    <Icon
                        name="solar:alt-arrow-left-outline"
                        class="w-4 h-4"
                    />
                </Button>

                <!-- Page input -->
                <div class="flex items-center gap-1">
                    <Input
                        :value="currentPage"
                        type="number"
                        :min="1"
                        :max="totalPages"
                        class="w-16 text-center"
                        :disabled="loading"
                        @change="handlePageInput"
                    />
                    <span class="text-sm text-muted-foreground">/ {{ totalPages }}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    :disabled="!canGoNext || loading"
                    @click="handleNext"
                >
                    <Icon
                        name="solar:alt-arrow-right-outline"
                        class="w-4 h-4"
                    />
                </Button>
            </div>
        </div>
    </div>

    <!-- Loading state -->
    <div
        v-else-if="loading"
        class="flex items-center justify-center py-4"
    >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon
                name="solar:refresh-outline"
                class="w-4 h-4 animate-spin"
            />
            {{ t('common.loading') }}
        </div>
    </div>
</template>

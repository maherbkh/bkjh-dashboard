<script setup lang="ts">
import type { PaginateMetaObject } from '~/types';

const props = defineProps<{
    meta: PaginateMetaObject;
}>();

const emit = defineEmits<{
    (e: 'update:page', page: number): void;
}>();

const total = computed(() => props.meta.total);
const perPage = computed(() => props.meta.perPage);
const currentPage = computed(() => props.meta.currentPage);
const lastPage = computed(() => props.meta.lastPage);

function goToPage(page: number) {
    if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
        emit('update:page', page);
    }
}

/** Number of page links to show at start and at end; middle is truncated with ellipsis. */
const PAGINATION_SIDES = 5;

type PageSlot = number | 'ellipsis';

const pageSlots = computed<PageSlot[]>(() => {
    const last = lastPage.value || 1;
    if (last <= PAGINATION_SIDES * 2) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
    const start = Array.from({ length: PAGINATION_SIDES }, (_, i) => i + 1);
    const end = Array.from({ length: PAGINATION_SIDES }, (_, i) => last - PAGINATION_SIDES + 1 + i);
    return [...start, 'ellipsis', ...end];
});
</script>

<template>
    <Pagination
        :items-per-page="perPage || 0"
        :total="total || 0"
        :default-page="currentPage || 1"
    >
        <PaginationContent>
            <PaginationPrevious
                class="cursor-pointer disabled:cursor-not-allowed"
                :disabled="(currentPage || 1) === 1"
                @click="goToPage((currentPage || 1) - 1)"
            />
            <template
                v-for="(slot, idx) in pageSlots"
                :key="slot === 'ellipsis' ? `ellipsis-${idx}` : slot"
            >
                <PaginationItem
                    v-if="slot !== 'ellipsis'"
                    class="cursor-pointer disabled:cursor-not-allowed"
                    :value="slot"
                    :is-active="slot === (currentPage || 1)"
                    @click="goToPage(slot)"
                >
                    {{ slot }}
                </PaginationItem>
                <PaginationEllipsis
                    v-else
                />
            </template>
            <PaginationNext
                class="cursor-pointer disabled:cursor-not-allowed"
                :disabled="(currentPage || 1) === (lastPage || 1)"
                @click="goToPage((currentPage || 1) + 1)"
            />
        </PaginationContent>
    </Pagination>
</template>

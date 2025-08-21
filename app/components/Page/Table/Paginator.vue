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

const pageNumbers = computed(() =>
    Array.from({ length: lastPage.value }, (_, i) => i + 1),
);
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
                v-for="page in pageNumbers"
                :key="page"
            >
                <PaginationItem
                    class="cursor-pointer disabled:cursor-not-allowed"
                    :value="page"
                    :is-active="page === (currentPage || 1)"
                    @click="goToPage(page)"
                >
                    {{ page }}
                </PaginationItem>
            </template>
            <PaginationNext
                class="cursor-pointer disabled:cursor-not-allowed"
                :disabled="(currentPage || 1) === (lastPage || 1)"
                @click="goToPage((currentPage || 1) + 1)"
            />
        </PaginationContent>
    </Pagination>
</template>

<script setup lang="ts">
const props = defineProps<{ searchQuery: string }>();
const emit = defineEmits(['update:searchQuery', 'searchSubmit', 'resetSearch']);

const internalSearchQuery = computed({
    get: () => props.searchQuery,
    set: value => emit('update:searchQuery', value),
});

const handleSearchSubmit = () => {
    emit('searchSubmit');
};

const handleReset = () => {
    emit('resetSearch');
};
</script>

<template>
    <form
        class="border-b p-4 grid lg:grid-cols-12 gap-4 items-start"
        @submit.prevent="handleSearchSubmit"
        @reset.prevent="handleReset"
    >
        <FormItemInput
            v-model="internalSearchQuery"
            :placeholder="$t('action.search_placeholder')"
            icon="solar:rounded-magnifer-linear"
            class="col-span-8"
        />
        <Button
            type="submit"
            class="cursor-pointer col-span-2"
            size="sm"
            variant="secondary"
        >
            <Icon
                class="shrink-0 w-full"
                name="solar:rounded-magnifer-linear"
            />
            {{ $t('action.search') }}
        </Button>
        <Button
            type="reset"
            class="cursor-pointer col-span-2"
            variant="outline"
            size="sm"
        >
            <Icon
                class="shrink-0 w-full"
                name="solar:restart-line-duotone"
            />
            {{ $t('action.reset') }}
        </Button>
    </form>
</template>

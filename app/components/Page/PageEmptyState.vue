<script setup lang="ts">
defineProps({
    searchQuery: {
        type: String,
        default: '',
    },
    addNewText: {
        type: String,
        default: 'add new',
    },
    noAddNewText: {
        type: Boolean,
        default: true,
    },
});
</script>

<template>
    <div class="flex flex-col gap-4 items-center place-content-center min-h-36 text-muted-foreground py-8">
        <Icon
            name="bi:database-fill-x"
            class="!size-20 opacity-50 "
        />
        <div class="text-center">
            <h4 class="text-lg">
                {{ $t('global.no_records_found') }}
            </h4>
            <template v-if="noAddNewText">
                <p
                v-if="searchQuery"
                class="text-sm font-light"
            >
                {{ $t('global.no_search_results') }} <span class="text-red-400">{{ searchQuery }}</span>
            </p>
            <p
                v-else
                class="text-sm font-light"
            >
                {{ $t('global.add_new_hint') }} <span class="font-semibold">{{ addNewText }}</span> {{ $t('global.button_above') }}
            </p>
            </template>
           
        </div>
    </div>
</template>

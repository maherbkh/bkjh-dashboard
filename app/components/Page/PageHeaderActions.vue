<script setup lang="ts">
defineProps({
    pageTitle: {
        type: String,
        required: true,
    },
    pageIcon: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['add-new']);
</script>

<template>
    <PageHeader
        :title="pageTitle"
        :icon="pageIcon"
    >
        <slot name="actions" />

        <Button
            class="cursor-pointer"
            size="sm"
            hydrate-on-interaction="mouseover"
            @click="emit('add-new')"
        >
            <Icon
                name="solar:clipboard-add-outline"
            />
            {{ $t('global.forms.add_new') }}
        </Button>
        <Button
            class="cursor-pointer"
            variant="secondary"
            size="sm"
        >
            <Icon
                name="solar:trash-bin-minimalistic-outline"
            />
            {{ $t('global.navigation.deleted_items') }}
        </Button>
    </PageHeader>
</template>

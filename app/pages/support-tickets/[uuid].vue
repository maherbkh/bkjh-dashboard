<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

// Get ID from route params
const id = computed(() => route.params.uuid as string);

// Page configuration
const pageTitle = computed(() => t("ticket.singular"));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t("ticket.singular"));
definePageMeta({
  middleware: "auth",
});

// Breadcrumb navigation
const breadcrumbItems = computed(() => [
  {
    title: t("global.dashboard"),
    href: "/",
  },
  {
    title: t("ticket.plural"),
    href: "/support-tickets",
  },
  {
    title: t("ticket.details"),
    href: route.fullPath,
  },
]);
</script>

<template>
  <div class="flex flex-col gap-6">
    <Ticket :id="id" />
  </div>
</template>

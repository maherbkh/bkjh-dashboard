<script setup lang="ts">
</script>

<template>
  <div>
  
    <NuxtRouteAnnouncer />
    <NuxtLayout>
            <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
    <Toaster
            rich-colors
            class="pointer-events-auto"
        />
  </ClientOnly>
  </div>
  
</template>

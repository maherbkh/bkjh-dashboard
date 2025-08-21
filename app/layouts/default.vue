<script setup lang="ts">

</script>

<template>
    <SidebarProvider>
        <NuxtLoadingIndicator
            :duration="5000"
            :height="4"
            :throttle="0"
            class="z-[9999]"
            color="oklch(58.8% 0.158 241.966)"
        />
        <AppSidebar />
        <SidebarInset>
            <div class="flex flex-col flex-1 h-full gap-4">
                <header class="flex h-12 shrink-0 items-center border-b justify-between md:pr-4 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div class="flex items-center gap-2 px-4">
                        <SidebarTrigger class="-ml-1" />
                        <Separator
                            orientation="vertical"
                            class="mr-2 h-4"
                        />
                        <!-- Replace the static breadcrumb with the dynamic BreadcrumbNav component -->
                        <BreadcrumbNav class="md:block hidden" />
                    </div>
                    <div class="flex items-center gap-5">
                        <ColorModeSwitcher />
                        <AppLangSelector />
                    </div>
                </header>
                <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <slot />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>

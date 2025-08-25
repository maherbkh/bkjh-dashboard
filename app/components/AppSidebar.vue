<script setup lang="ts">
import type { SidebarProps } from '~/components/ui/sidebar';
// useNavigationData is auto-imported as a Nuxt composable

const props = withDefaults(defineProps<SidebarProps>(), {
    collapsible: 'icon',
});
// Use the navigation data from constants
const data = useNavigationData();
</script>

<template>
    <Sidebar v-bind="props">
        <SidebarHeader>
            <AppSwitcher :apps="data.apps" />
        </SidebarHeader>
        <SidebarContent class="flex flex-col justify-between">
            <NavMain :items="data.navMain" />
            <!--            <NavProjects class="!text-xs" :projects="data.projects"/> -->
        </SidebarContent>
        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
</template>

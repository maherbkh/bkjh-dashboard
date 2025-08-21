<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar';

defineProps<{
    projects: {
        name: string;
        url: string;
        icon: string;
    }[];
}>();

const { isMobile } = useSidebar();
</script>

<template>
    <SidebarGroup class="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>{{ $t('global.sidebar.help_support') }}</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem
                v-for="item in projects"
                :key="item.name"
            >
                <SidebarMenuButton as-child>
                    <NuxtLink :to="item.url">
                        <Icon :name="item.icon" />
                        <span>{{ item.name }}</span>
                    </NuxtLink>
                </SidebarMenuButton>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <SidebarMenuAction show-on-hover>
                            <Icon name="solar:menu-dots-linear" />
                            <span class="sr-only">{{ $t('global.ui.more') }}</span>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        class="w-48 rounded-lg"
                        :side="isMobile ? 'bottom' : 'right'"
                        :align="isMobile ? 'end' : 'start'"
                    >
                        <DropdownMenuItem>
                            <Icon
                                name="solar:folder-with-files-linear"
                                class="text-muted-foreground"
                            />
                            <span>{{ $t('global.sidebar.view_project') }}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Icon
                                name="solar:forward-linear"
                                class="text-muted-foreground"
                            />
                            <span>{{ $t('global.sidebar.share_project') }}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Icon
                                name="solar:trash-bin-minimalistic-linear"
                                class="text-muted-foreground"
                            />
                            <span>{{ $t('global.sidebar.delete_project') }}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <NuxtLink
                    target="_black"
                    to="https://backhaus.de"
                >
                    <SidebarMenuButton class="text-sidebar-foreground/70 cursor-pointer">
                        <Icon
                            name="solar:global-linear"
                            class="text-sidebar-foreground/70"
                        />
                        <span>{{ $t('global.navigation.backhaus') }}</span>
                    </SidebarMenuButton>
                </NuxtLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <NuxtLink
                    target="_black"
                    to="https://backhaus.de"
                >
                    <SidebarMenuButton class="text-sidebar-foreground/70 cursor-pointer">
                        <Icon
                            name="solar:global-linear"
                            class="text-sidebar-foreground/70"
                        />
                        <span>{{ $t('global.navigation.faq') }}</span>
                    </SidebarMenuButton>
                </NuxtLink>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>

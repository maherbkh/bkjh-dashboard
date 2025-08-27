<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar';

defineProps<{
    items: {
        title: string;
        url: string;
        icon?: string;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
            icon?: string;
        }[];
    }[];
}>();

const { state } = useSidebar();
const route = useRoute();

// Function to check if a URL is active (matches current route path without params)
const isUrlActive = (url: string) => {
    const currentPath = route.path;
    const urlPath = url.split('?')[0]; // Remove query parameters
    return currentPath === urlPath;
};

// Function to check if any sub-item is active
const hasActiveSubItem = (items?: { url: string }[]) => {
    if (!items) return false;
    return items.some(item => isUrlActive(item.url));
};
</script>

<template>
    <SidebarGroup>
        <SidebarGroupLabel>{{ $t('global.overview') }}</SidebarGroupLabel>
        <SidebarMenu>
            <template
                v-for="item in items"
                :key="item.title"
            >
                <NuxtLink
                    v-if="!item.items || item.items.length === 0"
                    :to="item.url"
                >
                    <SidebarMenuButton
                        :tooltip="item.title"
                        :is-active="isUrlActive(item.url)"
                        class="cursor-pointer flex items-center gap-2"
                    >
                        <Icon
                            v-if="item.icon"
                            class="!size-5 opacity-75 shrink-0"
                            :name="item.icon"
                        />
                        <span>{{ item.title }}</span>
                    </SidebarMenuButton>
                </NuxtLink>

                <!-- Show dropdown when collapsed, collapsible when expanded -->
                <template v-if="state === 'collapsed' && item.items && item.items.length > 0">
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <SidebarMenuButton
                                    :tooltip="item.title"
                                    :is-active="hasActiveSubItem(item.items)"
                                    class="flex items-center cursor-pointer ease-in-out duration-300"
                                >
                                    <Icon
                                        v-if="item.icon"
                                        class="!size-5 opacity-75 shrink-0"
                                        :name="item.icon"
                                    />
                                    <span>{{ item.title }}</span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="right"
                                align="start"
                                class="w-48"
                            >
                                <DropdownMenuItem
                                    v-for="subItem in item.items"
                                    :key="subItem.title"
                                    as-child
                                >
                                    <NuxtLink
                                        :to="subItem.url"
                                        class="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Icon
                                            v-if="subItem.icon"
                                            class="!size-5 opacity-75"
                                            :name="subItem.icon"
                                        />
                                        <span>{{ subItem.title }}</span>
                                    </NuxtLink>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </template>

                <Collapsible
                    v-else-if="item.items && item.items.length > 0"
                    as-child
                    :default-open="hasActiveSubItem(item.items)"
                    class="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger as-child>
                            <SidebarMenuButton
                                :tooltip="item.title"
                                :is-active="hasActiveSubItem(item.items)"
                                class="flex items-center cursor-pointer ease-in-out duration-300"
                            >
                                <Icon
                                    v-if="item.icon"
                                    class="!size-5 opacity-75 shrink-0"
                                    :name="item.icon"
                                />
                                <span>{{ item.title }}</span>
                                <Icon
                                    name="solar:alt-arrow-down-outline"
                                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-0 rotate-90"
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem
                                    v-for="subItem in item.items"
                                    :key="subItem.title"
                                    class=""
                                >
                                    <SidebarMenuSubButton
                                        as-child
                                        :is-active="isUrlActive(subItem.url)"
                                    >
                                        <NuxtLink
                                            :to="subItem.url"
                                            class="items-center flex"
                                        >
                                            <Icon
                                                v-if="subItem.icon"
                                                class="!size-5 opacity-75"
                                                :name="subItem.icon"
                                            />
                                            <span>{{ subItem.title }}</span>
                                        </NuxtLink>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </template>
        </SidebarMenu>
    </SidebarGroup>
</template>

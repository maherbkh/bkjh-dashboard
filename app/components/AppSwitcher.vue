<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar'
import { useAppStore } from '~/stores/app'

type AppSlugType = 'support' | 'academy'

const props = defineProps<{
    apps: {
        name: string;
        logo: string;
        slug: string;
    }[];
}>();

const { isMobile } = useSidebar()
const appStore = useAppStore()

// Find active app based on current app slug
const activeApp = computed(() => {
    const currentApp = props.apps.find(app => app.slug === appStore.appSlug);
    return currentApp ?? props.apps?.[0] ?? { 
        name: '', 
        logo: 'solar:question-circle-linear', // fallback icon
        slug: 'support' 
    }
})

// Handle app switching
const handleAppClick = (app: typeof props.apps[0]) => {
    if (app.slug === 'support' || app.slug === 'academy') {
        appStore.setAppSlug(app.slug as AppSlugType)
        // Navigate to home dashboard page when app is switched
        navigateTo('/')
    }
}
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <SidebarMenuButton
                        size="lg"
                        class="bg-sidebar-accent data-[state=open]:bg-sidebar-primary data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                    >
                        <div class="flex aspect-square !size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Icon
                                :name="activeApp.logo"
                                class="!size-5"
                            />
                        </div>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">
                                {{ activeApp.name }}
                            </span>
                        </div>
                        <Icon
                            name="solar:alt-arrow-down-outline"
                            class="ml-auto"
                        />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    align="start"
                    :side="isMobile ? 'bottom' : 'right'"
                    :side-offset="4"
                >
                    <DropdownMenuLabel class="text-xs text-muted-foreground">
                        {{ $t('application.plural') }}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        v-for="(app, index) in apps"
                        :key="app.name"
                        class="gap-2 px-2 py-1 cursor-pointer my-1"
                        :class="{ 'bg-accent': app.slug === appStore.appSlug }"
                        @click="() => handleAppClick(app)"
                    >
                        <div class="flex size-6 items-center justify-center rounded-sm border">
                            <Icon
                                :name="app.logo"
                                class="size-5 shrink-0"
                            />
                        </div>
                        {{ app.name }}
                        <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</template>

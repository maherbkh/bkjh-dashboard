<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar';

const props = defineProps<{
    teams: {
        name: string;
        logo: string;
        plan: string;
    }[];
}>();

const { isMobile } = useSidebar();

const activeTeam = ref(props.teams?.[0] ?? { name: '', logo: '', plan: '' });
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
                                :name="activeTeam.logo"
                                class="!size-5"
                            />
                        </div>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">
                                {{ activeTeam.name }}
                            </span>
                            <span class="truncate text-xs">{{ activeTeam.plan }}</span>
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
                        {{ $t('navigation.projects') }}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        v-for="(team, index) in teams"
                        :key="team.name"
                        class="gap-2 px-2 py-1 cursor-pointer"
                        @click="activeTeam = team"
                    >
                        <div class="flex size-6 items-center justify-center rounded-sm border">
                            <Icon
                                :name="team.logo"
                                class="size-5 shrink-0"
                            />
                        </div>
                        {{ team.name }}
                        <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</template>

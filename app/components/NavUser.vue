<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar';
import { useUserStore } from '~/stores/user';

const { isMobile } = useSidebar();
const userStore = useUserStore();

const handleLogout = async () => {
    await userStore.logout();
};

const userInitials = computed(() => useInitials(userStore.user?.name ?? ''));
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <SidebarMenuButton
                        size="lg"
                        class="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-muted"
                    >
                        <Avatar class="h-8 w-8 rounded-full border">
                            <AvatarImage
                                v-if="userStore.user?.avatar"
                                class="bg-background"
                                :src="userStore.user?.avatar"
                                :alt="userStore.user?.name"
                            />
                            <AvatarFallback class="rounded-full bg-background">
                                {{ userInitials }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">{{ userStore.user?.name }}</span>
                            <span class="truncate text-xs">{{ userStore.user?.email }}</span>
                        </div>
                        <Icon
                            name="solar:double-alt-arrow-up-linear"
                            class="ml-auto size-4"
                        />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    :side="isMobile ? 'bottom' : 'right'"
                    align="end"
                    :side-offset="4"
                >
                    <DropdownMenuLabel class="p-0 font-normal">
                        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar class="h-8 w-8 rounded-full">
                                <AvatarImage
                                    v-if="userStore.user?.avatar"
                                    :src="userStore.user?.avatar"
                                    :alt="userStore.user?.name"
                                />
                                <AvatarFallback class="rounded-full">
                                    {{ userInitials }}
                                </AvatarFallback>
                            </Avatar>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-semibold">{{ userStore.user?.name }}</span>
                                <span class="truncate text-xs">{{ userStore.user?.email }}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <NuxtLink to="/profile/tasks">
                                <Icon name="solar:clipboard-list-outline" />
                                {{ $t('task.plural') }}
                            </NuxtLink>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <NuxtLink to="/profile">
                                <Icon name="solar:user-check-linear" />
                                {{ $t('user.account') }}
                            </NuxtLink>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        class="hover:text-destructive"
                        @click="handleLogout"
                    >
                        <Icon name="solar:logout-linear" />
                        {{ $t('auth.log_out') }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</template>

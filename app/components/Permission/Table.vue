<script setup lang="ts">
import type { Permission } from '~/types';
import { useResourcesStore } from '../../stores/resources';
import { onMounted, onUnmounted } from 'vue';

const { t } = useI18n();

interface Props {
    modelValue?: number[];
    disabled?: boolean;
    selectedPermissions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    disabled: false,
    selectedPermissions: () => [],
});

const emit = defineEmits<{
    'update:modelValue': [value: number[]];
}>();

// Use Pinia store for permissions
const resourcesStore = useResourcesStore();

// Initialize store on mount
onMounted(async () => {
    await resourcesStore.initialize();
});

// Use shallowRef for better memory management
const expandedGroups = shallowRef<Set<string>>(new Set());
const selectedPermissionsSet = shallowRef<Set<number>>(new Set());

// Group permissions by their group property with pagination concept
const groupedPermissions = computed(() => {
    const permissions = resourcesStore.permissionsGroup;
    if (!permissions || permissions.length === 0) return [];

    // Group permissions by their group property
    const grouped = permissions.reduce((acc, permission) => {
        const groupName = permission.group || 'other';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    // Convert to array format and sort
    return Object.entries(grouped)
        .map(([groupName, permissions]) => ({
            name: groupName,
            permissions: permissions.sort((a, b) => (a.position || 0) - (b.position || 0)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
});

// Only show permissions for expanded groups to reduce memory usage
const visiblePermissions = computed(() => {
    return groupedPermissions.value.map(group => ({
        ...group,
        permissions: expandedGroups.value.has(group.name) ? group.permissions : [],
    }));
});

// Loading and error states from store
const loading = ref(false);
const error = ref<string | null>(null);

// Toggle group expansion with memory optimization
const toggleGroupExpansion = (groupName: string) => {
    const newSet = new Set(expandedGroups.value);
    if (newSet.has(groupName)) {
        newSet.delete(groupName);
    }
    else {
        newSet.add(groupName);
    }
    expandedGroups.value = newSet;
};

// Check if group is expanded
const isGroupExpanded = (groupName: string) => expandedGroups.value.has(groupName);

// Initialize selected permissions from props
watch(() => props.selectedPermissions, (newSelected) => {
    if (newSelected && newSelected.length > 0) {
        selectedPermissionsSet.value = new Set(newSelected);
    }
    else {
        selectedPermissionsSet.value = new Set();
    }
}, { immediate: true });

// Watch for changes to modelValue and update selectedPermissions
watch(() => props.modelValue, (newValue) => {
    selectedPermissionsSet.value = new Set(newValue || []);
}, { immediate: true });

// Watch for changes to selectedPermissions and emit updates
watch(selectedPermissionsSet, (newValue) => {
    emit('update:modelValue', Array.from(newValue));
}, { deep: true });

// Helper function to check if permission is selected
const isPermissionSelected = (permissionId: number) => selectedPermissionsSet.value.has(permissionId);

// Toggle individual permission
const togglePermission = (permissionId: number) => {
    if (props.disabled) return;

    const newSet = new Set(selectedPermissionsSet.value);
    if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
    }
    else {
        newSet.add(permissionId);
    }
    selectedPermissionsSet.value = newSet;
};

// Toggle all permissions in a group
const toggleGroup = (groupName: string) => {
    if (props.disabled) return;

    const group = groupedPermissions.value.find(g => g.name === groupName);
    if (!group) return;

    const groupPermissionIds = group.permissions.map(p => p.id);
    const allSelected = groupPermissionIds.every(id => selectedPermissionsSet.value.has(id));

    const newSet = new Set(selectedPermissionsSet.value);

    if (allSelected) {
        // Deselect all permissions in this group
        groupPermissionIds.forEach(id => newSet.delete(id));
    }
    else {
        // Select all permissions in this group
        groupPermissionIds.forEach(id => newSet.add(id));
    }

    selectedPermissionsSet.value = newSet;
};

// Check if all permissions in a group are selected
const isGroupFullySelected = (groupName: string) => {
    const group = groupedPermissions.value.find(g => g.name === groupName);
    if (!group) return false;

    return group.permissions.every(p => selectedPermissionsSet.value.has(p.id));
};

// Check if some permissions in a group are selected
const isGroupPartiallySelected = (groupName: string) => {
    const group = groupedPermissions.value.find(g => g.name === groupName);
    if (!group) return false;

    const selectedCount = group.permissions.filter(p => selectedPermissionsSet.value.has(p.id)).length;
    return selectedCount > 0 && selectedCount < group.permissions.length;
};

// Select all permissions
const selectAll = () => {
    if (props.disabled) return;

    const allPermissionIds = groupedPermissions.value.flatMap(group =>
        group.permissions.map(p => p.id),
    );
    selectedPermissionsSet.value = new Set(allPermissionIds);
};

// Deselect all permissions
const deselectAll = () => {
    if (props.disabled) return;
    selectedPermissionsSet.value = new Set();
};

// Check if all permissions are selected
const isAllSelected = computed(() => {
    const allPermissionIds = groupedPermissions.value.flatMap(group =>
        group.permissions.map(p => p.id),
    );
    return allPermissionIds.length > 0 && allPermissionIds.every(id => selectedPermissionsSet.value.has(id));
});

// Check if some permissions are selected
const isSomeSelected = computed(() => {
    const allPermissionIds = groupedPermissions.value.flatMap(group =>
        group.permissions.map(p => p.id),
    );
    const selectedCount = selectedPermissionsSet.value.size;
    return selectedCount > 0 && selectedCount < allPermissionIds.length;
});

// Computed for selected count
const selectedCount = computed(() => selectedPermissionsSet.value.size);

// Refresh permissions from store
const refreshPermissions = () => {
    resourcesStore.fetchPermissionsGroup();
};

// Clean up memory on unmount
onUnmounted(() => {
    expandedGroups.value.clear();
    selectedPermissionsSet.value.clear();
});
</script>

<template>
    <div class="space-y-4">
        <!-- Header with select all/deselect all -->
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <Checkbox
                    :checked="isAllSelected"
                    :indeterminate="isSomeSelected"
                    :disabled="disabled || loading"
                    @update:checked="isAllSelected ? deselectAll() : selectAll()"
                />
                <Label class="text-sm font-medium">
                    {{ isAllSelected ? t('global.actions.deselect_all') : t('global.actions.select_all') }}
                </Label>
            </div>
            <div class="text-sm text-muted-foreground">
                {{ selectedCount }} {{ t('permissions.selected') }}
            </div>
        </div>

        <!-- Loading state -->
        <div
            v-if="loading"
            class="flex items-center justify-center py-8"
        >
            <div class="flex items-center space-x-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span class="text-sm text-muted-foreground">{{ t('global.loading') }}</span>
            </div>
        </div>

        <!-- Error state -->
        <div
            v-else-if="error"
            class="flex items-center justify-center py-8"
        >
            <div class="text-center">
                <div class="text-sm text-destructive">
                    {{ t('global.error_loading_data') }}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    class="mt-2"
                    @click="refreshPermissions()"
                >
                    {{ t('global.actions.retry') }}
                </Button>
            </div>
        </div>

        <!-- Permissions groups with expandable transitions -->
        <div
            v-else
            class="space-y-2"
        >
            <div
                v-for="group in groupedPermissions"
                :key="group.name"
                class="border rounded-lg overflow-hidden"
            >
                <!-- Group header with expand/collapse -->
                <div class="flex items-center justify-between p-3 bg-muted/35 border-b">
                    <div class="flex items-center space-x-3">
                        <div class="flex items-center space-x-2">
                            <Checkbox
                                :checked="isGroupFullySelected(group.name)"
                                :indeterminate="isGroupPartiallySelected(group.name)"
                                :disabled="disabled"
                                @update:checked="toggleGroup(group.name)"
                            />
                            <span class="text-sm font-medium">{{ t(`permissions.groups.${group.name}`) }}</span>
                        </div>
                        <Badge
                            variant="secondary"
                            class="text-xs"
                        >
                            {{ group.permissions.length }}
                        </Badge>
                    </div>

                    <!-- Separate expand/collapse button -->
                    <button
                        type="button"
                        class="flex items-center space-x-2 py-1 px-3 rounded justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                        :aria-expanded="isGroupExpanded(group.name)"
                        :aria-label="isGroupExpanded(group.name) ? t('global.common.collapse') : t('global.common.expand')"
                        @click="toggleGroupExpansion(group.name)"
                    >
                        <span class="text-sm text-muted-foreground">
                            {{ isGroupExpanded(group.name) ? t('global.common.collapse') : t('global.common.expand') }}
                        </span>
                        <Icon
                            :name="isGroupExpanded(group.name) ? 'solar:minus-circle-linear' : 'solar:plus-circle-linear'"
                            class="w-4 h-4 transition-transform duration-200"
                            :class="{ 'rotate-90': isGroupExpanded(group.name) }"
                        />
                    </button>
                </div>

                <!-- Expandable group content -->
                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-96"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 max-h-96"
                    leave-to-class="opacity-0 max-h-0"
                >
                    <div
                        v-show="isGroupExpanded(group.name)"
                        class="overflow-hidden"
                    >
                        <div class="p-3">
                            <div class="flex flex-wrap gap-3">
                                <Button
                                    v-for="permission in group.permissions"
                                    :key="permission.id"
                                    type="button"
                                    :disabled="disabled"
                                    :class="[
                                        'flex items-center py-2 px-3 rounded transition-colors min-w-0 border',
                                        isPermissionSelected(permission.id)
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-foreground border-input hover:bg-muted/50',
                                    ]"
                                    @click="togglePermission(permission.id)"
                                >
                                    <div class="flex flex-col min-w-0">
                                        <div class="text-sm font-medium truncate">
                                            {{ permission.name?.split(' ')[0] }}
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Empty state -->
        <div
            v-if="!loading && !error && groupedPermissions.length === 0"
            class="text-center py-8"
        >
            <div class="text-sm text-muted-foreground">
                {{ t('permissions.no_permissions_found') }}
            </div>
        </div>
    </div>
</template>

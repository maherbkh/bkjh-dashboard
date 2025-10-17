<script setup lang="ts">
import { useInitials } from '@/composables/useInitials';

const { t } = useI18n();
const { formatDateParts } = useGermanDateFormat();
interface EventRegistrationLite {
    id?: string | number;
    status?: string;
    registrationDate?: string;
    attendee?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        email?: string;
        isEmployee?: boolean;
        group?: { id?: string; name?: string } | null;
        occupation?: { id?: string; name?: string } | null;
    };
}
const props = defineProps<{
    data: EventRegistrationLite[];
}>();

const headerItems = computed(() => [
    { as: 'th', name: t('attendee.person'), id: 'person' },
    { as: 'th', name: t('attendee.employment_details'), id: 'employment' },
    { as: 'th', name: t('attendee.registration_info'), id: 'registration' },
]);

const selectedStatusTab = ref<string>('ALL');

const selectStatusTab = (status: "ALL" | "PENDING" | "APPROVED" | "REJECTED") => {
    selectedStatusTab.value = status;
};

const filteredData = computed(() => {
    return props.data.filter((item: EventRegistrationLite) => {
        switch (selectedStatusTab.value) {
            case 'ALL':
                return true;
            case 'PENDING':
                return item.status === 'PENDING';
            case 'APPROVED':
                return item.status === 'APPROVED';
            case 'REJECTED':
                return item.status === 'REJECTED';
        }
    });
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <div>
            <ul class="grid lg:grid-cols-4 gap-4">
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'ALL' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('ALL')"
                    >
                        All
                    </Button>
                </li>
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'PENDING' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('PENDING')"
                    >
                        Pending
                    </Button>
                </li>
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'APPROVED' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('APPROVED')"
                    >
                        Approved
                    </Button>
                </li>
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'REJECTED' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('REJECTED')"
                    >
                        Rejected
                    </Button>
                </li>
            </ul>
        </div>
        <PageTable
            :header-items="headerItems"
            :rows="filteredData"
            :selected-rows="[]"
            :loading="false"
            :skeleton-rows="3"
            :selectable="false"
            :sortable="false"
        >
            <template #cell-person="{ row }">
                <div class="flex flex-col">
                    <div>
                        <div class="flex items-center gap-2">
                            <div>
                                <Avatar
                                    class="size-9 rounded-full border
                                   group-active:bg-sidebar-primary group-active:text-sidebar-primary-foreground
                                   group-data-[state=open]:bg-sidebar-accent group-data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <AvatarImage
                                        class="bg-background"
                                        :src="row.attendee?.avatar"
                                        :alt="row.attendee?.fullName"
                                    />
                                    <AvatarFallback class="rounded-full bg-background">
                                        {{ useInitials(row.attendee?.fullName) }}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <div class="font-medium">
                                    {{ row.attendee?.fullName }}
                                </div>
                                <div class="text-muted-foreground text-xs">
                                    {{ row.attendee?.email }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-2">
                    <NuxtLink :to="`/events/attendees/${row.attendee?.id}`">
                        <LazyButton
                            :title="$t('action.view')"
                            variant="ghost"
                            size="icon"
                            hydrate-on-interaction="mouseover"
                        >
                            <Icon
                                name="solar:eye-outline"
                                class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                            />
                        </LazyButton>
                    </NuxtLink>
                </div>
            </template>

            <template #cell-employment="{ row }">
                <template v-if="row.attendee?.isEmployee">
                    <div class="flex flex-col">
                        <div
                            v-if="row.attendee?.occupation?.name"
                            class="font-medium truncate"
                        >
                            {{ row.attendee.occupation.name }}
                        </div>
                        <div
                            v-if="row.attendee?.group?.name"
                            class="text-muted-foreground truncate text-sm"
                        >
                            {{ row.attendee.group.name }}
                        </div>
                    </div>
                </template>
                <span
                    v-else
                    class="text-muted-foreground"
                >—</span>
            </template>

            <template #cell-registration="{ row }">
                <div class="flex flex-col">
                    <div class="text-sm font-medium flex items-start gap-1.5">
                        <div class="flex items-start gap-1.5">
                            <Icon
                                name="solar:calendar-mark-line-duotone"
                                class="opacity-50 !size-4"
                            />
                            {{ formatDateParts(row.registrationDate).date }}
                        </div>
                        <Icon
                            name="solar:arrow-right-bold-duotone"
                            class="size-5 mt-0.5 shrink-0 opacity-50"
                        />
                        <div class="flex items-start gap-1.5">
                            <Icon
                                name="solar:watch-square-line-duotone"
                                class="opacity-50 !size-4"
                            />
                            {{ formatDateParts(row.registrationDate).time }}
                        </div>
                    </div>
                    <div class="mt-1">
                        <Badge
                            :variant="row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'pending' : 'destructive'"
                            class="w-fit"
                        >
                            {{ row.status }}
                        </Badge>
                    </div>
                </div>
            </template>
        </PageTable>
    </div>
</template>

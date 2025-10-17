<script lang="ts" setup>
import type { AttendeeData } from '~/types';
import { useInitials } from '~/composables/useInitials';

const { formatDateShort, formatTimeOnly } = useGermanDateFormat();

const props = defineProps<{
    attendee: AttendeeData;
}>();

const emit = defineEmits<{
    edit: [];
}>();

const { t } = useI18n();

// Calculate statistics
const confirmedRegistrations = computed(() =>
    props.attendee.events?.filter(event => event.registrationStatus === 'CONFIRMED').length || 0,
);

const pendingRegistrations = computed(() =>
    props.attendee.events?.filter(event => event.registrationStatus === 'PENDING').length || 0,
);

const router = useRouter();
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Attendee Not Found State -->
        <div
            v-if="!props.attendee"
            class="flex flex-col items-center justify-center py-16 text-center"
        >
            <div class="flex items-center justify-center size-20 rounded-full bg-muted mb-6">
                <Icon
                    name="solar:user-cross-outline"
                    class="!size-10 text-muted-foreground"
                />
            </div>
            <h2 class="text-2xl font-semibold text-foreground mb-2">
                {{ $t("action.message.not_found_title", { model: $t("attendee.singular") }) }}
            </h2>
            <p class="text-muted-foreground mb-6 max-w-md">
                {{ $t("action.message.not_found_description", { model: $t("attendee.singular") }) }}
            </p>
            <div class="flex items-center gap-3">
                <NuxtLink to="/events/attendees">
                    <Button>
                        <Icon
                            name="solar:arrow-left-linear"
                            class="mr-2 h-4 w-4"
                        />
                        {{ $t("action.back") + " " + $t("common.to") + " " + $t("attendee.plural") }}
                    </Button>
                </NuxtLink>
            </div>
        </div>
        <!-- Attendee Content -->
        <div
            v-else-if="props.attendee"
            class="space-y-6"
        >
            <!-- Header -->
            <div class="flex lg:flex-row flex-col gap-5 lg:items-center justify-between">
                <div class="flex items-start gap-4">
                    <Avatar
                        class="size-16 rounded-full border
                           group-active:bg-sidebar-primary group-active:text-sidebar-primary-foreground
                           group-data-[state=open]:bg-sidebar-accent group-data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <AvatarImage
                            v-if="props.attendee.avatar"
                            class="bg-background"
                            :src="props.attendee.avatar"
                            :alt="props.attendee.fullName"
                        />
                        <AvatarFallback class="rounded-full bg-background text-lg">
                            {{ useInitials(props.attendee.fullName) }}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div class="text-lg font-bold flex items-center gap-4">
                            <div>{{ props.attendee.fullName }}</div>
                            <Icon
                                :title="props.attendee.isActive ? 'Attendee is Active' : 'Attendee is not active'"
                                :name="props.attendee.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
                                :class="[(props.attendee.isActive ? 'text-success' : 'text-muted-foreground'), 'shrink-0 size-5']"
                            />
                        </div>
                        <div class="mt-1 text-muted-foreground flex items-center gap-2">
                            <div class="text-sm">
                                {{ props.attendee.email }}
                            </div>
                            <div
                                v-if="props.attendee.isEmployee"
                                class="text-sm"
                            >
                                • {{ $t('attendee.employee') }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        @click="router.back()"
                    >
                        <Icon name="solar:arrow-left-outline" />
                        {{ $t("action.back") }}
                    </Button>
                    <Button
                        size="sm"
                        @click="emit('edit')"
                    >
                        <Icon name="solar:pen-outline" />
                        {{ $t("action.edit") }}
                    </Button>
                </div>
            </div>
            <!-- Statistics Grid -->
            <div class="grid lg:grid-cols-3 gap-4">
                <EventBox
                    title="Total Events"
                    icon="solar:calendar-line-duotone"
                    :value="props.attendee.eventsCount"
                />
                <EventBox
                    title="Confirmed Registrations"
                    icon="solar:check-circle-line-duotone"
                    :value="confirmedRegistrations"
                />
                <EventBox
                    title="Pending Registrations"
                    icon="solar:clock-circle-line-duotone"
                    :value="pendingRegistrations"
                />
            </div>
            <!-- Attendee Details Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <!-- Main Content -->
                <div class="xl:col-span-8 space-y-6">
                    <!-- Events Table -->
                    <Card>
                        <CardHeader>
                            <CardTitle class="flex items-center gap-2">
                                <Icon
                                    name="solar:calendar-line-duotone"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("academy.plural") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <EventsTable
                                    :data="props.attendee.events || []"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div class="xl:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Icon
                                    name="solar:documents-minimalistic-outline"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("global.information") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="flex flex-col divide-y divide-dashed">
                            <AppListItem
                                :title="$t('attendee.email')"
                                :value="props.attendee.email"
                            />
                            <AppListItem
                                :title="$t('attendee.employee_status')"
                                :value="props.attendee.isEmployee ? $t('common.yes') : $t('common.no')"
                            />
                            <AppListItem
                                v-if="props.attendee.group?.name"
                                :title="$t('group.singular')"
                                :value="props.attendee.group.name"
                            />
                            <AppListItem
                                v-if="props.attendee.occupation?.name"
                                :title="$t('occupation.singular')"
                                :value="props.attendee.occupation.name"
                            />
                            <AppListItem
                                v-if="props.attendee.lastLoginAt"
                                :title="$t('attendee.last_login')"
                                :value="formatDateShort(props.attendee.lastLoginAt)"
                            />
                            <AppListItem
                                :title="$t('common.created_at')"
                                :value="formatDateShort(props.attendee.createdAt)"
                            />
                            <AppListItem
                                :title="$t('common.updated_at')"
                                :value="formatDateShort(props.attendee.updatedAt)"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

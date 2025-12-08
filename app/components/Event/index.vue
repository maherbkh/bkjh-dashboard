<script lang="ts" setup>
import type { EventData } from '~/types';
import { useInitials } from '~/composables/useInitials';

const { formatDateShort, formatTimeOnly } = useGermanDateFormat();
const { getDirectImageSrc } = useAuthenticatedImage();

const props = defineProps<{
    event: EventData;
}>();

const emit = defineEmits<{
    reload: [];
}>();

const { t } = useI18n();

// Get avatar image source for speaker using media composable
const getSpeakerAvatarSrc = (speaker: any) => {
    const speakerData = speaker.speaker || speaker;

    // Priority 1: Use avatarUrl if provided by the API
    const avatarUrl = (speakerData as any)?.avatarUrl;
    if (avatarUrl) {
        return getDirectImageSrc({ url: avatarUrl });
    }

    // Priority 2: Use avatar field if available
    const avatar = speakerData?.avatar;
    if (!avatar) return null;

    // Handle different avatar formats - use media composable
    if (typeof avatar === 'string') {
        const avatarId = avatar.trim();
        if (avatarId.length > 0) {
            return getDirectImageSrc({ uuid: avatarId });
        }
        return null;
    }

    // If it's a MediaEntity object, use getDirectImageSrc directly
    if (avatar && typeof avatar === 'object' && 'id' in avatar) {
        return getDirectImageSrc(avatar);
    }

    return null;
};
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Event Not Found State -->
        <div
            v-if="!props.event"
            class="flex flex-col items-center justify-center py-16 text-center"
        >
            <div class="flex items-center justify-center size-20 rounded-full bg-muted mb-6">
                <Icon
                    name="solar:ticket-cross-outline"
                    class="!size-10 text-muted-foreground"
                />
            </div>
            <h2 class="text-2xl font-semibold text-foreground mb-2">
                {{ $t("action.message.not_found_title", { model: $t("academy.singular") }) }}
            </h2>
            <p class="text-muted-foreground mb-6 max-w-md">
                {{ $t("action.message.not_found_description", { model: $t("academy.singular") }) }}
            </p>
            <div class="flex items-center gap-3">
                <NuxtLink to="/events">
                    <Button>
                        <Icon
                            name="solar:arrow-left-linear"
                            class="mr-2 h-4 w-4"
                        />
                        {{ $t("action.back") + " " + $t("common.to") + " " + $t("academy.plural") }}
                    </Button>
                </NuxtLink>
            </div>
        </div>
        <!-- Event Content -->
        <div
            v-else-if="props.event"
            class="space-y-6"
        >
            <!-- Header -->
            <div class="flex lg:flex-row flex-col gap-5 lg:items-center justify-between">
                <div class="flex items-start gap-4">
                    <Icon
                        name="solar:calendar-line-duotone"
                        class="!size-5 shrink-0 opacity-75 mt-1"
                    />
                    <div>
                        <div class="text-lg font-bold flex items-center gap-4">
                            <div>{{ event.title }}</div>
                            <Icon
                                :title="event.isActive ? $t('event.currently_active') : $t('event.not_active')"
                                :name="event.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
                                :class="[(event.isActive ? 'text-success' : 'text-muted-foreground'), 'shrink-0 size-5']"
                            />
                        </div>
                        <div
                            v-if="event.schedules && event.schedules.length > 0"
                            class="mt-1 text-muted-foreground flex items-center gap-2"
                        >
                            <div class="text-sm">
                                {{ formatDateShort(event.schedules[0]?.date as string) }}
                            </div>
                            <template v-if="event.schedules.length > 1">
                                <Icon
                                    name="solar:arrow-right-bold-duotone"
                                    class="size-5 shrink-0 opacity-75"
                                />
                                <div class="text-sm">
                                    {{ formatDateShort(event.schedules[(event.schedules.length - 1)]?.date as string) }}
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <NuxtLink :to="`/events/${props.event.id}/edit`">
                        <Button
                            variant="default"
                            size="sm"
                        >
                            <Icon name="solar:pen-new-square-outline" />
                            {{ $t("action.edit") }}
                        </Button>
                    </NuxtLink>
                    <Button>
                        <Icon
                            name="solar:round-arrow-down-line-duotone"
                            class="mr-2 h-4 w-4"
                        />
                        {{ $t("event.download_attendees_list") }}
                    </Button>
                </div>
            </div>
            <!-- Ticket Details Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <!-- Main Content -->
                <div class="xl:col-span-8 space-y-6">
                    <!-- Description and Content Card -->
                    <div class="grid lg:grid-cols-3 gap-4">
                        <EventBox
                            :title="$t('event.approved_attendees')"
                            icon="solar:user-id-line-duotone"
                            :value="event.approvedRegistrationsCount as number"
                            :variant="(event.isFull || (event.maxCapacity === event.approvedRegistrationsCount)) ? 'destructive' : 'default'"
                        />
                        <EventBox
                            :title="$t('event.pending_attendees')"
                            icon="solar:users-group-two-rounded-linear"
                            :value="Number((event.registrationsCount as number) - (event.approvedRegistrationsCount as number))"
                        />
                        <EventBox
                            :title="$t('event.event_days')"
                            icon="solar:calendar-line-duotone"
                            :value="event.schedulesCount as number"
                        />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle class="flex items-center gap-2">
                                <Icon
                                    name="solar:clipboard-text-broken"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("global.short_description") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p class="whitespace-pre-wrap font-mono">
                                {{ event.shortDescription }}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle class="flex items-center gap-2">
                                <Icon
                                    name="solar:document-text-linear"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("global.description") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                class="content"
                                v-html="event.description"
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle class="flex items-center gap-2">
                                <Icon
                                    name="solar:users-group-two-rounded-line-duotone"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("attendee.plural") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <EventAttendeesTable
                                    :data="event.registrations as any[]"
                                    @reload="emit('reload')"
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
                                :title="$t('academy.type')"
                                :value="event.type"
                            />
                            <AppListItem
                                :title="$t('category.singular')"
                                :value="event.categories && event.categories.length > 0
                                    ? event.categories.map((cat: any) => cat.eventCategory?.name || cat.name).join(', ')
                                    : (event.eventCategory?.name || $t('common.not_assigned'))"
                            />
                            <AppListItem
                                :title="$t('target.singular')"
                                :value="event.targets && event.targets.length > 0
                                    ? event.targets.map((target: any) => target.eventTarget?.name || target.name).join(', ')
                                    : (event.eventTarget?.name || $t('common.not_assigned'))"
                            />

                            <AppListItem
                                :title="$t('academy.duration')"
                                :value="event.schedulesCount + ' ' + (event.schedulesCount === 1 ? $t('common.day') : $t('common.days')) "
                            />

                            <AppListItem
                                :title="$t('academy.capacity')"
                                :value="event.maxCapacity"
                            />

                            <div class="flex items-start gap-4 md:flex-row flex-col justify-between first:pt-0 last:pb-0 py-1.5">
                                <div class="font-medium text-muted-foreground">
                                    {{ $t('event.approved_attendees') }}
                                </div>
                                <div class="font-light font-mono">
                                    <span
                                        :class="[
                                            (event.isFull || (event.maxCapacity === event.approvedRegistrationsCount)) ? 'text-destructive' : '',
                                            (event.isFull && event.maxCapacity !== event.approvedRegistrationsCount) ? 'cursor-pointer' : '',
                                        ]"
                                        :title="(event.isFull && event.maxCapacity !== event.approvedRegistrationsCount) ? $t('event.manually_set_full') : ''"
                                    >
                                        {{ event.approvedRegistrationsCount || 0 }}
                                    </span>
                                </div>
                            </div>

                            <AppListItem
                                :title="$t('academy.room')"
                                :value="event.room"
                            />

                            <AppListItem
                                :title="$t('academy.location')"
                                :value="event.location"
                            />

                            <AppListItem
                                :title="$t('event.for_kids')"
                                :value="event.forKids ? $t('common.yes') : $t('common.no')"
                            />

                            <AppListItem
                                :title="$t('event.disable_registration')"
                                :value="event.disableRegistration ? $t('common.yes') : $t('common.no')"
                            />

                            <AppListItem
                                :title="$t('event.is_full')"
                                :value="event.isFull ? $t('common.yes') : $t('common.no')"
                            />

                            <AppListItem
                                :title="$t('academy.createdBy')"
                                :value="event.admin?.firstName + ' ' + event.admin?.lastName"
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Icon
                                    name="solar:user-speak-rounded-line-duotone"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("academy.speakers") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="flex flex-col">
                            <div
                                v-for="speaker in event.speakers"
                                :key="speaker.id"
                                class="bg-muted/50 p-3 px-4 rounded-2xl border border-border/75 flex items-center gap-4 my-1"
                            >
                                <Avatar
                                    class="size-9 rounded-full border
                                   group-active:bg-sidebar-primary group-active:text-sidebar-primary-foreground
                                   group-data-[state=open]:bg-sidebar-accent group-data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <AvatarImage
                                        v-if="getSpeakerAvatarSrc(speaker)"
                                        :src="getSpeakerAvatarSrc(speaker)"
                                        :alt="speaker.speaker.name"
                                        class="bg-background object-cover object-center"
                                    />
                                    <AvatarFallback class="rounded-full bg-background">
                                        {{ useInitials(speaker.speaker.name) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-semibold">{{ speaker.speaker.name }}</span>
                                    <span class="truncate text-xs max-w-52">{{ speaker.speaker.qualification }}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Icon
                                    name="solar:calendar-line-duotone"
                                    class="!size-5 opacity-75 shrink-0"
                                />
                                {{ $t("academy.schedules") }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="flex flex-col">
                            <div
                                v-for="day in event.schedules"
                                :key="day.id"
                                class="bg-muted/50 p-3 px-4 rounded-2xl border border-border/75 flex items-center gap-4 my-1"
                            >
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <div class="flex items-center gap-3 justify-between">
                                        <div class="truncate font-semibold">
                                            {{ formatDateShort(day.date) }}
                                        </div>
                                        <div class="flex items-center gap-2 mt-1 font-medium">
                                            <div class="truncate opacity-75 flex items-center">
                                                <Icon
                                                    name="solar:watch-square-line-duotone"
                                                    class="!size-4 shrink-0 mr-1.5"
                                                />
                                                {{ day.startTime }}
                                            </div>
                                            <Icon
                                                name="solar:arrow-right-bold-duotone"
                                                class="size-5 shrink-0 opacity-75"
                                            />
                                            <div class="truncate opacity-75 flex items-center">
                                                <Icon
                                                    name="solar:watch-square-line-duotone"
                                                    class="!size-4 shrink-0 mr-1.5"
                                                />
                                                {{ day.endTime }}
                                            </div>
                                        </div>
                                    </div>
                                    <div :class="[!day.note && 'italic', 'font-mono text-xs leading-tight mt-1 text-muted-foreground']">
                                        {{ day.note ? day.note : $t("common.not_assigned") }}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

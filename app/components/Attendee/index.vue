<script lang="ts" setup>
import type { AttendeeData } from '~/types';
import { useInitials } from '~/composables/useInitials';

const { formatDateShort, formatRelative } = useGermanDateFormat();
const { t } = useI18n();
const router = useRouter();

const props = defineProps<{
    attendee: AttendeeData;
}>();

const emit = defineEmits<{
    edit: [];
    refresh: [];
}>();

const { sendVerificationEmail, isSendingVerificationEmail } = useAttendeeActions();

const confirmedCount = computed(() =>
    props.attendee.events?.filter(e => e.registrationStatus === 'CONFIRMED').length ?? 0,
);
const pendingCount = computed(() =>
    props.attendee.events?.filter(e => e.registrationStatus === 'PENDING').length ?? 0,
);
/** Registrations carry `hasAttended`; the embedded `events` list may omit `ATTENDED` status. */
const attendedCount = computed(() => {
    const regs = props.attendee.registrations;
    if (regs != null) {
        return regs.filter(r => r.hasAttended).length;
    }
    return props.attendee.events?.filter(e => e.registrationStatus === 'ATTENDED').length ?? 0;
});

const emailVerifiedLabel = computed(() => {
    if (props.attendee.emailVerifiedAt) return t('common.yes');
    return t('common.no');
});

const metaParts = computed(() => {
    const parts: { key: string; text: string }[] = [];
    parts.push({ key: 'email', text: props.attendee.email });
    if (props.attendee.group?.name) {
        parts.push({ key: 'group', text: props.attendee.group.name });
    }
    if (props.attendee.occupation?.name) {
        parts.push({ key: 'job', text: props.attendee.occupation.name });
    }
    return parts;
});

const lastLoginDisplay = computed(() => {
    if (!props.attendee.lastLoginAt) return '—';
    return `${formatDateShort(props.attendee.lastLoginAt)} · ${formatRelative(props.attendee.lastLoginAt)}`;
});

async function onResendVerification() {
    await sendVerificationEmail(props.attendee.id, async () => {
        emit('refresh');
    });
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Compact header (aligned with Event / Ticket detail headers) -->
        <div
            class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="flex min-w-0 items-start gap-3">
                <Avatar class="size-10 shrink-0 rounded-lg border shadow-sm sm:size-11">
                    <AvatarImage
                        v-if="attendee.avatar"
                        :src="attendee.avatar"
                        :alt="attendee.fullName"
                        class="rounded-lg object-cover"
                    />
                    <AvatarFallback class="rounded-lg text-sm font-normal">
                        {{ useInitials(attendee.fullName) }}
                    </AvatarFallback>
                </Avatar>
                <div class="min-w-0 space-y-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h1 class="text-base font-bold tracking-tight sm:text-lg">
                            {{ attendee.fullName }}
                        </h1>
                        <Badge
                            :variant="attendee.isActive ? 'success' : 'secondary'"
                            class="shrink-0 px-3 text-xs font-normal uppercase"
                        >
                            {{ attendee.isActive ? $t('common.active') : $t('common.inactive') }}
                        </Badge>
                        <Badge
                            :variant="attendee.isEmployee ? 'default' : 'outline'"
                            class="shrink-0 px-3 text-xs font-normal uppercase"
                        >
                            {{ attendee.isEmployee ? $t('attendee.employee') : $t('attendee.non_employee') }}
                        </Badge>
                    </div>
                    <p
                        class="text-xs text-muted-foreground sm:text-sm"
                    >
                        <template
                            v-for="(part, i) in metaParts"
                            :key="part.key"
                        >
                            <span
                                v-if="i > 0"
                                class="mx-1.5 text-border select-none"
                                aria-hidden="true"
                            >·</span>
                            <span class="break-all">{{ part.text }}</span>
                        </template>
                    </p>
                </div>
            </div>
            <div class="flex shrink-0 flex-wrap items-center gap-2 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
                <Button
                    variant="outline"
                    size="sm"
                    class="px-5"
                    @click="router.back()"
                >
                    <Icon
                        name="solar:arrow-left-outline"
                        class="size-4"
                    />
                    {{ $t('action.back') }}
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    class="px-5"
                    :disabled="isSendingVerificationEmail || attendee.emailVerifiedAt"
                    @click="onResendVerification"
                >
                    <Icon
                        :name="isSendingVerificationEmail ? 'svg-spinners:ring-resize' : 'solar:letter-outline'"
                        class="size-4 shrink-0"
                    />
                    <span class="max-w-40 truncate sm:max-w-none">{{
                        attendee.emailVerifiedAt
                            ? $t('attendee.email_verified')
                            : $t('attendee.resend_verification_email')
                    }}</span>
                </Button>
                <Button
                    size="sm"
                    class="px-5 hover:opacity-75! ease-in-out duration-300"
                    @click="emit('edit')"
                >
                    <Icon
                        name="solar:pen-outline"
                        class="size-4"
                    />
                    {{ $t('action.edit') }}
                </Button>
            </div>
        </div>

        <!-- KPI strip -->
        <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <EventBox
                :title="$t('academy.plural')"
                icon="solar:calendar-line-duotone"
                :value="attendee.eventsCount"
                compact
            />
            <EventBox
                :title="$t('academy.pending')"
                icon="solar:clock-circle-line-duotone"
                :value="pendingCount"
                compact
            />
            <EventBox
                :title="$t('event.approved')"
                icon="solar:check-circle-line-duotone"
                :value="confirmedCount"
                compact
            />
            <EventBox
                :title="$t('attendee.visited')"
                icon="solar:star-shine-line-duotone"
                :value="attendedCount"
                compact
            />
        </div>

        <!-- Same grid + Card pattern as Ticket detail (Ticket/index.vue) -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div class="min-w-0 xl:col-span-8">
                <Tabs
                    default-value="events"
                    class="w-full"
                >
                    <TabsList class="grid h-9 w-full max-w-md grid-cols-2 p-1">
                        <TabsTrigger
                            value="events"
                            class="text-xs sm:text-sm"
                        >
                            {{ $t('academy.plural') }}
                            <Badge
                                v-if="attendee.events?.length"
                                variant="secondary"
                                class="ml-1.5 h-5 min-w-5 px-1 text-[10px] tabular-nums"
                            >
                                {{ attendee.events.length }}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="registrations"
                            class="text-xs sm:text-sm"
                        >
                            {{ $t('attendee.registrations') }}
                            <Badge
                                v-if="attendee.registrations?.length"
                                variant="secondary"
                                class="ml-1.5 h-5 min-w-5 px-1 text-[10px] tabular-nums"
                            >
                                {{ attendee.registrations.length }}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="events"
                        class="mt-6 outline-none focus-visible:ring-0"
                    >
                        <AttendeeEventsTable :data="attendee.events ?? []" />
                    </TabsContent>
                    <TabsContent
                        value="registrations"
                        class="mt-6 outline-none focus-visible:ring-0"
                    >
                        <AttendeeRegistrationsTable :data="attendee.registrations ?? []" />
                    </TabsContent>
                </Tabs>
            </div>

            <div class="space-y-6 xl:col-span-4">
                <Card class="self-start xl:sticky xl:top-4">
                    <CardHeader>
                        <CardTitle class="flex items-center gap-2">
                            <Icon
                                name="solar:info-circle-outline"
                                class="size-5! shrink-0 opacity-75"
                                aria-hidden="true"
                            />
                            {{ $t('common.information') }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="flex flex-col divide-y divide-dashed">
                        <AppListItem
                            :title="$t('attendee.email_verified')"
                            :value="emailVerifiedLabel"
                        />
                        <AppListItem
                            :title="$t('attendee.last_login')"
                            :value="lastLoginDisplay"
                        />
                        <AppListItem
                            :title="$t('common.created_at')"
                            :value="formatDateShort(attendee.createdAt)"
                        />
                        <AppListItem
                            :title="$t('common.updated_at')"
                            :value="formatDateShort(attendee.updatedAt)"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

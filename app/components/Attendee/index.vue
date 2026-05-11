<script lang="ts" setup>
import type { AttendeeData, AttendeeCertificate } from '~/types';
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
const { downloadCertificate } = useCertificateDownload();
const { getDirectImageSrc } = useAuthenticatedImage();

// ── Stats (all derived from registrations — events[] removed from API) ────────
const pendingCount = computed(() =>
    props.attendee.registrations?.filter(r => r.registrationStatus === 'PENDING').length ?? 0,
);
const confirmedCount = computed(() =>
    props.attendee.registrations?.filter(
        r => r.registrationStatus === 'APPROVED' || r.registrationStatus === 'CONFIRMED',
    ).length ?? 0,
);
const attendedCount = computed(() =>
    props.attendee.registrations?.filter(r => r.hasAttended).length ?? 0,
);

// ── Sidebar meta ────────────────────────────────────────────────────────────────
const emailVerifiedLabel = computed(() =>
    props.attendee.emailVerifiedAt || props.attendee.emailVerified ? t('common.yes') : t('common.no'),
);

const metaParts = computed(() => {
    const parts: { key: string; text: string }[] = [];
    parts.push({ key: 'email', text: props.attendee.email });
    if (props.attendee.group?.name) parts.push({ key: 'group', text: props.attendee.group.name });
    if (props.attendee.occupation?.name) parts.push({ key: 'job', text: props.attendee.occupation.name });
    return parts;
});

const lastLoginDisplay = computed(() => {
    if (!props.attendee.lastLoginAt) return '—';
    return `${formatDateShort(props.attendee.lastLoginAt)} · ${formatRelative(props.attendee.lastLoginAt)}`;
});

// ── Certificates ────────────────────────────────────────────────────────────────
const downloadingCertId = ref<string | null>(null);

async function onDownloadCertificate(cert: AttendeeCertificate) {
    if (!cert.media?.path) return;
    downloadingCertId.value = cert.id;
    try {
        const url = getDirectImageSrc({ path: cert.media.path });
        await downloadCertificate(
            { certificateUrl: url, expiresAt: cert.expireAt, createdAt: cert.createdAt },
            { attendeeName: props.attendee.fullName, eventTitle: cert.event.title },
        );
    }
    finally {
        downloadingCertId.value = null;
    }
}

// ── Verification ────────────────────────────────────────────────────────────────
async function onResendVerification() {
    await sendVerificationEmail(props.attendee.id, async () => emit('refresh'));
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                        <!-- Pending alerts inline with name -->
                        <Badge
                            v-if="attendee.hasPendingDeletion"
                            variant="destructive"
                            class="shrink-0 px-3 text-xs font-normal uppercase"
                        >
                            <Icon
                                name="solar:trash-bin-minimalistic-2-outline"
                                class="size-3 mr-1"
                            />
                            {{ $t('attendee.pending_deletion') }}
                        </Badge>
                        <Badge
                            v-if="attendee.hasPendingEmailChange"
                            variant="secondary"
                            class="shrink-0 px-3 text-xs font-normal uppercase"
                        >
                            <Icon
                                name="solar:letter-outline"
                                class="size-3 mr-1"
                            />
                            {{ $t('attendee.pending_email_change') }}
                        </Badge>
                    </div>
                    <p class="text-xs text-muted-foreground sm:text-sm">
                        <template
                            v-for="(part, i) in metaParts"
                            :key="part.key"
                        >
                            <span
                                v-if="i > 0"
                                class="mx-1.5 select-none text-border"
                                aria-hidden="true"
                            >·</span>
                            <span class="break-all">{{ part.text }}</span>
                        </template>
                    </p>
                </div>
            </div>

            <!-- Action buttons -->
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
                    :disabled="isSendingVerificationEmail || !!(attendee.emailVerifiedAt || attendee.emailVerified)"
                    @click="onResendVerification"
                >
                    <Icon
                        :name="isSendingVerificationEmail ? 'svg-spinners:ring-resize' : 'solar:letter-outline'"
                        class="size-4 shrink-0"
                    />
                    <span class="max-w-40 truncate sm:max-w-none">{{
                        (attendee.emailVerifiedAt || attendee.emailVerified)
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

        <!-- KPI strip: Events | Pending | Attended | Certificates -->
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
                :title="$t('attendee.visited')"
                icon="solar:star-shine-line-duotone"
                :value="attendedCount"
                compact
            />
            <EventBox
                :title="$t('attendee.certificates_count')"
                icon="solar:diploma-line-duotone"
                :value="attendee.certificatesCount ?? attendee.certificates?.length ?? 0"
                compact
            />
        </div>

        <!-- Main content + Info sidebar -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <!-- Left: tabs -->
            <div class="min-w-0 xl:col-span-8">
                <Tabs
                    default-value="registrations"
                    class="w-full"
                >
                    <TabsList class="grid h-9 w-full max-w-md grid-cols-2 p-1">
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
                        <TabsTrigger
                            value="certificates"
                            class="text-xs sm:text-sm"
                        >
                            {{ $t('attendee.certificates') }}
                            <Badge
                                v-if="attendee.certificates?.length"
                                variant="secondary"
                                class="ml-1.5 h-5 min-w-5 px-1 text-[10px] tabular-nums"
                            >
                                {{ attendee.certificates.length }}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="registrations"
                        class="mt-6 outline-none focus-visible:ring-0"
                    >
                        <AttendeeRegistrationsTable :data="attendee.registrations ?? []" />
                    </TabsContent>

                    <TabsContent
                        value="certificates"
                        class="mt-6 outline-none focus-visible:ring-0"
                    >
                        <div
                            v-if="!attendee.certificates?.length"
                            class="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground"
                        >
                            <Icon
                                name="solar:diploma-line-duotone"
                                class="size-10! opacity-40"
                            />
                            <p class="text-sm">
                                {{ $t('attendee.no_certificates') }}
                            </p>
                        </div>
                        <div
                            v-else
                            class="space-y-2"
                        >
                            <div
                                v-for="cert in attendee.certificates"
                                :key="cert.id"
                                class="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
                            >
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-medium">
                                        {{ cert.event.title }}
                                    </p>
                                    <p
                                        v-if="cert.expireAt"
                                        class="mt-0.5 text-xs text-muted-foreground"
                                    >
                                        {{ $t('attendee.certificate_expires') }}: {{ formatDateShort(cert.expireAt) }}
                                    </p>
                                    <p class="mt-0.5 text-xs text-muted-foreground">
                                        {{ formatDateShort(cert.createdAt) }}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    :disabled="downloadingCertId === cert.id"
                                    @click="onDownloadCertificate(cert)"
                                >
                                    <Icon
                                        :name="downloadingCertId === cert.id
                                            ? 'svg-spinners:ring-resize'
                                            : 'solar:round-arrow-down-line-duotone'"
                                        class="size-4 shrink-0"
                                    />
                                    {{ $t('event.download_certificate') }}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <!-- Right: Info card (ticket style) -->
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
                            v-if="attendee.hrWorksLink"
                            :title="$t('attendee.hr_works_link')"
                            :value="attendee.hrWorksLink"
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

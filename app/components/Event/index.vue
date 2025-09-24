<script lang="ts" setup>
import type { EventData } from '~/types';
const { formatDate } = useGermanDateFormat();

const props = defineProps<{
    event: EventData;
}>();

const { t } = useI18n();
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Ticket Not Found State -->
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

        <!-- Ticket Content -->
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
                                :title="event.isActive ? 'Event Currently Active' : 'Event is not active'"
                                :name="event.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
                                :class="[(event.isActive ? 'text-success' : 'text-muted-foreground'), 'shrink-0 size-5']"
                            />
                        </div>
                        <div v-if="event.schedules && event.schedules.length > 0" class="mt-1 text-muted-foreground flex items-center gap-2">
                            <div class="text-sm">
                                {{ useGermanDateFormat().formatDateShort(event.schedules[0]?.date) }}
                            </div>
                            <template v-if="event.schedules.length > 1">
                                <Icon
                                    name="solar:arrow-right-bold-duotone"
                                    class="size-5 shrink-0 opacity-75"
                                />
                                <div class="text-sm">
                                    {{ useGermanDateFormat().formatDateShort(event.schedules[(event.schedules.length - 1)]?.date) }}
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <NuxtLink :to="`/events/${props.event.id}/edit`">
                        <Button variant="default" size="sm">
                            <Icon name="solar:pen-new-square-outline" />
                            {{ $t("action.edit") }}
                        </Button>
                    </NuxtLink>
                </div>
            </div>

            <!-- Ticket Details Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <!-- Main Content -->
                <div class="xl:col-span-8 space-y-6">
                    <!-- Description and Content Card -->
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
                            <p v-html="event.description" />
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
                                :value="event.eventCategory?.name"
                            />
                            <AppListItem
                                :title="$t('target.singular')"
                                :value="event.eventTarget?.name"
                            />

                            <AppListItem
                                :title="$t('academy.duration')"
                                :value="event.schedulesCount + ' ' + (event.schedulesCount === 1 ? $t('common.day') : $t('common.days')) "
                            />

                            <AppListItem
                                :title="$t('academy.capacity')"
                                :value="event.maxCapacity"
                            />

                            <AppListItem
                                :title="$t('academy.room')"
                                :value="event.room"
                            />

                            <AppListItem
                                :title="$t('academy.location')"
                                :value="event.location"
                            />

                            <AppListItem
                                :title="$t('academy.createdBy')"
                                :value="event.admin?.firstName + ' ' + event.admin?.lastName"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

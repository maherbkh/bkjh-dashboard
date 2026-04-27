<script setup lang="ts">
import type { BookingApiStatus, BookingDaySegment } from '~/composables/useBookingCalendarView';
import type { BookingActionSelection } from '~/composables/useBookingActions';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';

type Props = {
    segment: BookingDaySegment;
};

const props = defineProps<Props>();
const isMenuOpen = ref(false);

const emit = defineEmits<{
    (e: 'select-action', payload: BookingActionSelection): void;
}>();

const statusOptions: BookingApiStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'];

function isCurrentStatus(status: BookingApiStatus): boolean {
    return props.segment.status === status.toLowerCase();
}

function getStatusIcon(status: BookingApiStatus): string {
    if (status === 'APPROVED') return 'solar:check-circle-linear';
    if (status === 'PENDING') return 'solar:clock-circle-linear';
    if (status === 'REJECTED') return 'solar:close-circle-linear';
    return 'solar:stop-circle-linear';
}

function getStatusClasses(status: BookingApiStatus): string {
    const base = 'gap-2';
    if (status === 'APPROVED') return `${base} text-success`;
    if (status === 'PENDING') return `${base} text-warning`;
    if (status === 'REJECTED') return `${base} text-destructive`;
    return `${base} text-muted-foreground`;
}

function emitAction(
    action: BookingActionSelection['action'],
    nextStatus?: BookingApiStatus,
) {
    if (action === 'change_status' && nextStatus && isCurrentStatus(nextStatus)) {
        isMenuOpen.value = false;
        return;
    }
    isMenuOpen.value = false;
    nextTick(() => {
        emit('select-action', {
            action,
            bookingId: props.segment.bookingId,
            nextStatus,
        });
    });
}
</script>

<template>
    <ContextMenu
        v-model:open="isMenuOpen"
    >
        <ContextMenuTrigger as-child>
            <slot />
        </ContextMenuTrigger>

        <ContextMenuContent class="w-56">
            <ContextMenuItem @select="emitAction('edit')">
                <Icon name="solar:pen-linear" />
                {{ $t('booking.calendar.action_menu.edit') }}
            </ContextMenuItem>
            <ContextMenuItem @select="emitAction('duplicate')">
                <Icon name="solar:copy-outline" />
                {{ $t('booking.calendar.action_menu.duplicate') }}
            </ContextMenuItem>

            <ContextMenuSub>
                <ContextMenuSubTrigger class="gap-2">
                    <Icon name="solar:refresh-outline" />
                    {{ $t('booking.calendar.action_menu.change_status') }}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent class="w-56">
                    <ContextMenuItem
                        v-for="status in statusOptions"
                        :key="status"
                        :disabled="false"
                        :class="[
                            'cursor-pointer',
                            getStatusClasses(status),
                            isCurrentStatus(status) ? 'bg-accent/40 font-semibold ring-1 ring-border/60' : '',
                        ]"
                        @select="emitAction('change_status', status)"
                    >
                        <Icon :name="getStatusIcon(status)" />
                        {{ $t(`booking.calendar.status_options.${status.toLowerCase()}`) }}
                        <Icon
                            v-if="isCurrentStatus(status)"
                            name="solar:check-read-linear"
                            class="ml-auto"
                        />
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSeparator />
            <ContextMenuItem
                variant="destructive"
                @select="emitAction('cancel', 'CANCELED')"
            >
                <Icon name="solar:close-circle-outline" />
                {{ $t('booking.calendar.action_menu.cancel_booking') }}
            </ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
</template>

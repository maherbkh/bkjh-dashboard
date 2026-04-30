/**
 * Typed interfaces for the car-bookings real-time WebSocket channel.
 *
 * Aligns 1-to-1 with the backend API specification (Section 6).
 * Import these in composables/components that deal with Socket.IO booking events.
 */

import type { BookingApiStatus } from '~/composables/useBookingCalendarView';

// ── Full booking record ────────────────────────────────────────────────────────
// Payload shape for `booking.created` and `booking.updated` events.

export interface BookingRealtimePayload {
    readonly id: string;
    readonly carId: string;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly status: BookingApiStatus;
    readonly requesterName: string;
    readonly requesterEmail: string;
    readonly distance: number;
    readonly requesterNote: string | null;
    readonly adminNote: string | null;
    readonly groupId: string | null;
    readonly safeReference: string | null;
    readonly safePin: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
}

// ── Deleted event ──────────────────────────────────────────────────────────────

export interface BookingDeletedPayload {
    readonly id: string;
}

// ── Presence / live-editing ────────────────────────────────────────────────────

export interface BookingEditorInfo {
    readonly adminId: string;
    readonly adminEmail: string;
}

export interface BookingEditorsChangedPayload {
    readonly bookingId: string;
    readonly editors: readonly BookingEditorInfo[];
}

// ── Socket event maps (typed socket.io-client usage) ──────────────────────────

export interface ServerToClientEvents {
    'booking.created': (payload: BookingRealtimePayload) => void;
    'booking.updated': (payload: BookingRealtimePayload) => void;
    'booking.deleted': (payload: BookingDeletedPayload) => void;
    'booking.editors-changed': (payload: BookingEditorsChangedPayload) => void;
}

export interface ClientToServerEvents {
    'booking:subscribe': (
        body: Record<string, never>,
        ack?: (res: { ok: true; room: string }) => void,
    ) => void;
    'booking:unsubscribe': (
        body: Record<string, never>,
        ack?: (res: { ok: true; room: string }) => void,
    ) => void;
    'booking:edit-start': (body: { bookingId: string }) => void;
    'booking:edit-end': (body: { bookingId: string }) => void;
}

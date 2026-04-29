/**
 * Booking-specific realtime composable.
 *
 * Wraps useRealtimeSocket with:
 *  - Booking room subscription / unsubscription lifecycle
 *  - Typed, normalized event callbacks (onCreated, onUpdated, onDeleted)
 *  - Presence stub — wired and ready, activate once backend ships booking.presence
 *
 * Handlers are registered immediately on composable creation (before connect),
 * so no event is missed during the connection handshake.
 *
 * Cleanup (leave + handler removal) runs automatically on component unmount
 * via onUnmounted. The underlying socket stays alive for other consumers.
 */

import type { BookingApiStatus, BookingCalendarRecord } from '~/composables/useBookingCalendarView';

// ── Public types ──────────────────────────────────────────────────────────────

/** Viewer shape for the presence feature (backend not yet ready). */
export type BookingPresenceViewer = {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    /** ISO timestamp of when they opened the record. */
    since: string;
};

export type BookingRealtimeCallbacks = {
    onCreated?: (record: BookingCalendarRecord) => void;
    onUpdated?: (record: BookingCalendarRecord) => void;
    onDeleted?: (bookingId: string) => void;
    /** Called when a realtime payload cannot be parsed — use to schedule a fallback refresh. */
    onInvalidPayload?: () => void;
    /**
     * @future — activated automatically once backend starts emitting `booking.presence`.
     * Payload: { resourceId, viewers }
     */
    onPresenceUpdate?: (resourceId: string, viewers: BookingPresenceViewer[]) => void;
};

export type BookingRealtimeConfig = {
    getSocketUrl: () => string;
    getToken: () => string | null | undefined;
};

// ── Payload normalization ─────────────────────────────────────────────────────
// Kept inside this composable: it is booking-specific and should not leak
// into page components or the generic socket layer.

type RawBookingPayload = {
    id: string;
    carId: string;
    startsAt: string;
    endsAt: string;
    status: BookingApiStatus;
    requesterName?: string;
    requesterEmail?: string;
    distance?: number;
    requesterNote?: string | null;
    adminNote?: string | null;
    groupId?: string | null;
    safeReference?: string;
    createdAt?: string;
    updatedAt?: string;
};

const VALID_STATUSES = new Set<string>(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED']);

function _unwrap(input: unknown): unknown {
    if (!input || typeof input !== 'object') return null;
    const r = input as Record<string, unknown>;
    return r.data && typeof r.data === 'object' ? r.data : input;
}

function _isRawBookingPayload(v: unknown): v is RawBookingPayload {
    if (!v || typeof v !== 'object') return false;
    const s = v as Record<string, unknown>;
    return typeof s.id === 'string'
        && typeof s.carId === 'string'
        && typeof s.startsAt === 'string'
        && typeof s.endsAt === 'string'
        && VALID_STATUSES.has(s.status as string);
}

function _normalizeRecord(input: unknown): BookingCalendarRecord | null {
    const raw = _unwrap(input);
    if (!_isRawBookingPayload(raw)) return null;
    return {
        id: raw.id,
        carId: raw.carId,
        startsAt: raw.startsAt,
        endsAt: raw.endsAt,
        status: raw.status,
        requesterName: String(raw.requesterName ?? ''),
        requesterEmail: String(raw.requesterEmail ?? ''),
        distance: Number(raw.distance ?? 0),
        requesterNote: typeof raw.requesterNote === 'string' ? raw.requesterNote : null,
        adminNote: typeof raw.adminNote === 'string' ? raw.adminNote : null,
        groupId: typeof raw.groupId === 'string' ? raw.groupId : null,
        safeReference: String(raw.safeReference ?? ''),
        safePin: '',
        createdAt: String(raw.createdAt ?? new Date().toISOString()),
        updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    };
}

function _extractId(input: unknown): string | null {
    const raw = _unwrap(input);
    if (!raw || typeof raw !== 'object') return null;
    const id = (raw as Record<string, unknown>).id;
    return typeof id === 'string' ? id : null;
}

function _normalizePresence(input: unknown): { resourceId: string; viewers: BookingPresenceViewer[] } | null {
    const raw = _unwrap(input);
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.resourceId !== 'string' || !Array.isArray(r.viewers)) return null;
    return {
        resourceId: r.resourceId,
        viewers: (r.viewers as unknown[]).filter(
            (v): v is BookingPresenceViewer =>
                typeof v === 'object' && v !== null && typeof (v as BookingPresenceViewer).userId === 'string',
        ),
    };
}

// ── Composable ────────────────────────────────────────────────────────────────

/** Shared pool key — all booking pages share one socket connection. */
const POOL_KEY = 'dashboard-realtime';

export function useBookingRealtime(config: BookingRealtimeConfig, callbacks: BookingRealtimeCallbacks = {}) {
    const socket = useRealtimeSocket({
        key: POOL_KEY,
        getUrl: config.getSocketUrl,
        getToken: config.getToken,
    });

    // ── Register all handlers immediately ──────────────────────────────────────
    // The event bus in useRealtimeSocket stores them before the socket exists,
    // so no events are missed during the connection handshake.

    const offConnect = socket.on('connect', () => {
        console.info('[booking-realtime] emitting booking:subscribe');
        socket.emit('booking:subscribe', {});
    });

    const offCreated = socket.on('booking.created', (payload) => {
        console.info('[booking-realtime] booking.created raw payload:', payload);
        const record = _normalizeRecord(payload);
        if (record) callbacks.onCreated?.(record);
        else {
            console.warn('[booking-realtime] booking.created payload failed normalization:', payload);
            callbacks.onInvalidPayload?.();
        }
    });

    const offUpdated = socket.on('booking.updated', (payload) => {
        const record = _normalizeRecord(payload);
        if (record) callbacks.onUpdated?.(record);
        else callbacks.onInvalidPayload?.();
    });

    const offDeleted = socket.on('booking.deleted', (payload) => {
        const id = _extractId(payload);
        if (id) callbacks.onDeleted?.(id);
        else callbacks.onInvalidPayload?.();
    });

    // Presence — stub: handler is registered now, activates the moment
    // the backend starts emitting `booking.presence` with no further changes needed.
    const offPresence = socket.on('booking.presence', (payload) => {
        const data = _normalizePresence(payload);
        if (data) callbacks.onPresenceUpdate?.(data.resourceId, data.viewers);
    });

    // ── Public API ─────────────────────────────────────────────────────────────

    async function connect(): Promise<void> {
        await socket.connect();
        // Emit subscribe immediately if the socket was already live
        // (e.g. navigating back to this page without a reconnect)
        if (socket.connectionState.value === 'live') {
            socket.emit('booking:subscribe', {});
        }
    }

    /** Unsubscribe from the booking room and remove all handlers for this instance.
     *  The underlying socket stays connected for other consumers. */
    function leave(): void {
        socket.emit('booking:unsubscribe', {});
        offConnect();
        offCreated();
        offUpdated();
        offDeleted();
        offPresence();
    }

    // Auto-cleanup when the component that called this composable unmounts.
    onUnmounted(leave);

    return {
        connectionState: socket.connectionState,
        connect,
        leave,
        /** Full socket teardown — call only on logout, never on page unmount. */
        stop: socket.stop,
    };
}

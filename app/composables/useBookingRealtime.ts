/**
 * Booking real-time composable.
 *
 * Wraps useRealtimeSocket with:
 *  - Booking room subscription / unsubscription lifecycle
 *  - Typed, normalized event callbacks (onCreated, onUpdated, onDeleted)
 *  - Live-editing presence system via `booking.editors-changed`
 *    — reactive `editorsMap`, `startEditing`, `stopEditing`, `isBeingEdited`, `editorsOf`
 *
 * Handlers are registered immediately on composable creation (before connect),
 * so no event is missed during the connection handshake.
 *
 * On `booking:subscribe`, the server replays the full current presence state,
 * so late joiners receive all active editors without waiting for the next change.
 *
 * Cleanup (unsubscribe + handler removal + presence map clear) runs automatically
 * on component unmount via onUnmounted. The underlying socket stays alive.
 */

import type { BookingApiStatus, BookingCalendarRecord } from '~/composables/useBookingCalendarView';
import type {
    BookingEditorInfo,
    BookingEditorsChangedPayload,
} from '~/types/carBookingRealtime';

// ── Public callback types ─────────────────────────────────────────────────────

export type BookingRealtimeCallbacks = {
    onCreated?: (record: BookingCalendarRecord) => void;
    onUpdated?: (record: BookingCalendarRecord) => void;
    onDeleted?: (bookingId: string) => void;
    /** Called when a realtime payload cannot be parsed — use to schedule a fallback refresh. */
    onInvalidPayload?: () => void;
    /**
     * Called whenever the editor set for a booking changes.
     * The reactive `editorsMap` is always kept in sync; this callback is optional
     * and useful when the caller wants to react to specific changes imperatively.
     */
    onEditorsChanged?: (bookingId: string, editors: readonly BookingEditorInfo[]) => void;
};

export type BookingRealtimeConfig = {
    getSocketUrl: () => string;
    getToken: () => string | null | undefined;
};

// ── Internal payload types ─────────────────────────────────────────────────────

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
    safeReference?: string | null;
    safePin?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

const VALID_STATUSES = new Set<string>(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED']);

// ── Payload normalization ─────────────────────────────────────────────────────

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
        safePin: typeof raw.safePin === 'string' ? raw.safePin : '',
        createdAt: String(raw.createdAt ?? new Date().toISOString()),
        updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    };
}

function _extractDeletedId(input: unknown): string | null {
    const raw = _unwrap(input);
    if (!raw || typeof raw !== 'object') return null;
    const id = (raw as Record<string, unknown>).id;
    return typeof id === 'string' ? id : null;
}

function _normalizeEditorsChanged(input: unknown): BookingEditorsChangedPayload | null {
    if (!input || typeof input !== 'object') return null;
    const r = input as Record<string, unknown>;
    if (typeof r.bookingId !== 'string') return null;
    if (!Array.isArray(r.editors)) return null;

    const editors: BookingEditorInfo[] = (r.editors as unknown[]).filter(
        (v): v is BookingEditorInfo =>
            typeof v === 'object'
            && v !== null
            && typeof (v as BookingEditorInfo).adminId === 'string'
            && typeof (v as BookingEditorInfo).adminEmail === 'string',
    );

    return { bookingId: r.bookingId, editors };
}

// ── Composable ────────────────────────────────────────────────────────────────

/** All booking pages share one socket connection via this pool key. */
const POOL_KEY = 'dashboard-realtime';

export function useBookingRealtime(config: BookingRealtimeConfig, callbacks: BookingRealtimeCallbacks = {}) {
    const socket = useRealtimeSocket({
        key: POOL_KEY,
        getUrl: config.getSocketUrl,
        getToken: config.getToken,
    });

    // Reactive presence map: bookingId → current editors
    // shallowRef so Vue tracks Map identity changes; we swap on every update.
    const editorsMap = shallowRef<Map<string, readonly BookingEditorInfo[]>>(new Map());

    // ── Event handlers ─────────────────────────────────────────────────────────
    // All registered immediately — events during the handshake are never missed.

    const offConnect = socket.on('connect', () => {
        console.info('[booking-realtime] connected — emitting booking:subscribe');
        socket.emit('booking:subscribe', {});
    });

    const offCreated = socket.on('booking.created', (payload) => {
        console.info('[booking-realtime] booking.created', payload);
        const record = _normalizeRecord(payload);
        if (record) callbacks.onCreated?.(record);
        else {
            console.warn('[booking-realtime] booking.created payload failed normalization', payload);
            callbacks.onInvalidPayload?.();
        }
    });

    const offUpdated = socket.on('booking.updated', (payload) => {
        const record = _normalizeRecord(payload);
        if (record) callbacks.onUpdated?.(record);
        else callbacks.onInvalidPayload?.();
    });

    const offDeleted = socket.on('booking.deleted', (payload) => {
        const id = _extractDeletedId(payload);
        if (id) callbacks.onDeleted?.(id);
        else callbacks.onInvalidPayload?.();
    });

    // Presence system — `booking.editors-changed` is emitted by the server:
    //  • on booking:edit-start / booking:edit-end
    //  • on socket disconnect (auto-cleanup by server)
    //  • replayed in full on booking:subscribe (initial state sync for late joiners)
    const offEditorsChanged = socket.on('booking.editors-changed', (payload) => {
        const data = _normalizeEditorsChanged(payload);
        if (!data) return;

        const next = new Map(editorsMap.value);
        if (data.editors.length === 0) {
            next.delete(data.bookingId);
        }
        else {
            next.set(data.bookingId, data.editors);
        }
        editorsMap.value = next;

        callbacks.onEditorsChanged?.(data.bookingId, data.editors);
    });

    // ── Public API ─────────────────────────────────────────────────────────────

    async function connect(): Promise<void> {
        await socket.connect();
        // If the socket was already live (e.g. navigating back to this page),
        // re-subscribe so the server replays the current presence state.
        if (socket.connectionState.value === 'live') {
            socket.emit('booking:subscribe', {});
        }
    }

    /**
     * Notify other admins that you have opened a booking for editing.
     * Emit on opening an edit/change-status dialog.
     * The server broadcasts `booking.editors-changed` to all room subscribers.
     */
    function startEditing(bookingId: string): void {
        socket.emit('booking:edit-start', { bookingId });
    }

    /**
     * Notify other admins that you have closed the booking record.
     * Emit on saving, cancelling, or navigating away from the dialog.
     * The server broadcasts `booking.editors-changed` with an empty editors array.
     */
    function stopEditing(bookingId: string): void {
        socket.emit('booking:edit-end', { bookingId });
    }

    /** Returns true if any other admin currently has this booking open. */
    function isBeingEdited(bookingId: string): boolean {
        return (editorsMap.value.get(bookingId)?.length ?? 0) > 0;
    }

    /** Returns the list of admins currently editing the given booking (empty if none). */
    function editorsOf(bookingId: string): readonly BookingEditorInfo[] {
        return editorsMap.value.get(bookingId) ?? [];
    }

    /**
     * Unsubscribe from the booking room and remove all event handlers for this instance.
     * The underlying socket stays connected for other consumers.
     * Called automatically on component unmount.
     */
    function leave(): void {
        socket.emit('booking:unsubscribe', {});
        offConnect();
        offCreated();
        offUpdated();
        offDeleted();
        offEditorsChanged();
        editorsMap.value = new Map();
    }

    onUnmounted(leave);

    return {
        connectionState: socket.connectionState,
        /** Reactive map of bookingId → editors currently editing that booking. */
        editorsMap: readonly(editorsMap),
        connect,
        leave,
        startEditing,
        stopEditing,
        isBeingEdited,
        editorsOf,
        /** Full socket teardown — call only on logout, never on page unmount. */
        stop: socket.stop,
    };
}

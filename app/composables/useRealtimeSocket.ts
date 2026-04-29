/**
 * Generic, pool-based WebSocket composable built on Socket.IO v4.
 *
 * One socket per namespace key is maintained for the lifetime of the app.
 * Multiple composable instances with the same key share one underlying socket,
 * so page navigation never causes an unnecessary reconnect.
 *
 * Auth token is supplied as a Socket.IO v4 auth callback — it is re-evaluated
 * on every (re)connect automatically, so token refresh requires no extra work.
 *
 * Usage:
 *   const socket = useRealtimeSocket({ key, getUrl, getToken })
 *   await socket.connect()
 *   const off = socket.on('some.event', handler)   // works before connect() too
 *   onUnmounted(off)
 */

import type { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

// ── Public types ──────────────────────────────────────────────────────────────

export type RealtimeConnectionState = 'idle' | 'connecting' | 'live' | 'recovering' | 'stopped';

export type RealtimeSocketConfig = {
    /** Pool key — two calls with the same key share one socket. Use the namespace URL. */
    key: string;
    /** Returns the full namespace URL, e.g. https://api.example.com/my-namespace */
    getUrl: () => string;
    /** Returns the raw auth token; Bearer prefix is stripped automatically. */
    getToken: () => string | null | undefined;
    /** Merged on top of the default socket.io options. */
    socketOptions?: Partial<ManagerOptions & SocketOptions>;
};

// ── Internal pool ─────────────────────────────────────────────────────────────

type EventBus = Map<string, Set<(payload: unknown) => void>>;

type PoolEntry = {
    socket: Socket | null;
    connectionState: Ref<RealtimeConnectionState>;
    bus: EventBus;
    connecting: boolean;
    stopping: boolean;
};

const _pool = new Map<string, PoolEntry>();

// Debug: expose pool in browser console → window.__realtimePool
if (import.meta.client) {
    (window as unknown as Record<string, unknown>).__realtimePool = _pool;
}

function _getEntry(key: string): PoolEntry {
    if (!_pool.has(key)) {
        _pool.set(key, {
            socket: null,
            connectionState: ref<RealtimeConnectionState>('idle'),
            bus: new Map(),
            connecting: false,
            stopping: false,
        });
    }
    return _pool.get(key)!;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _normalizeUrl(raw: string): string {
    return raw
        .replace(/\/+$/, '')
        .replace(/^wss:\/\//, 'https://')
        .replace(/^ws:\/\//, 'http://');
}

function _resolveToken(raw: string | null | undefined): string {
    if (!raw) return '';
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
}

function _dispatch(bus: EventBus, event: string, payload: unknown): void {
    bus.get(event)?.forEach(h => h(payload));
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useRealtimeSocket(config: RealtimeSocketConfig) {
    const entry = _getEntry(config.key);

    /**
     * Create and connect the socket if not already done.
     * Safe to call multiple times — noop when already connected.
     * On token change, the Socket.IO auth callback picks it up on the next reconnect;
     * call stop() + connect() only when the user identity changes (e.g. logout/login).
     */
    async function connect(): Promise<void> {
        if (!import.meta.client || entry.connecting || entry.stopping) return;
        if (entry.socket?.connected) return;

        entry.connecting = true;
        entry.connectionState.value = 'connecting';

        try {
            if (entry.socket) {
                // Socket exists but disconnected — reconnect with refreshed token
                entry.socket.connect();
                return;
            }

            const { io } = await import('socket.io-client');

            const socket = io(_normalizeUrl(config.getUrl()), {
                // Socket.IO v4: auth as a callback — re-evaluated on every (re)connect
                // so token refresh is transparent without recreating the socket.
                auth: (cb: (data: Record<string, string>) => void) => {
                    cb({ token: _resolveToken(config.getToken()) });
                },
                transports: ['websocket', 'polling'],
                withCredentials: true,
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 500,
                reconnectionDelayMax: 8000,
                randomizationFactor: 0.5,
                timeout: 10000,
                ...config.socketOptions,
            });

            // System events → update state + fan-out to bus
            socket.on('connect', () => {
                entry.connectionState.value = 'live';
                console.info(`[realtime:${config.key}] connected`, socket.id);
                _dispatch(entry.bus, 'connect', undefined);
            });

            socket.on('disconnect', (reason) => {
                if (entry.stopping) return;
                // 'io server disconnect' = server actively closed us, don't loop
                entry.connectionState.value = reason === 'io server disconnect' ? 'idle' : 'recovering';
                console.warn(`[realtime:${config.key}] disconnected`, reason);
                _dispatch(entry.bus, 'disconnect', reason);
            });

            socket.on('connect_error', (err) => {
                if (!entry.stopping) entry.connectionState.value = 'recovering';
                console.error(`[realtime:${config.key}] connect_error`, err.message, err);
                _dispatch(entry.bus, 'connect_error', err);
            });

            // Application events → fan-out to bus
            socket.onAny((event: string, payload: unknown) => {
                console.info(`[realtime:${config.key}] event:${event}`, payload);
                _dispatch(entry.bus, event, payload);
            });

            entry.socket = socket;
            socket.connect();
        }
        catch {
            entry.connectionState.value = 'recovering';
        }
        finally {
            entry.connecting = false;
        }
    }

    /**
     * Full teardown — removes the socket from the pool.
     * Call this on logout. Do NOT call on page unmount (use the feature composable's
     * leave() instead, which unsubscribes from rooms but keeps the socket alive).
     */
    function stop(): void {
        entry.stopping = true;
        if (entry.socket) {
            entry.socket.removeAllListeners();
            entry.socket.disconnect();
        }
        entry.socket = null;
        entry.bus.clear();
        entry.connectionState.value = 'stopped';
        entry.stopping = false;
        _pool.delete(config.key);
    }

    /**
     * Register a handler for one or more events.
     * Works before connect() is called — handlers survive reconnects automatically.
     * Returns a cleanup function; pass it to onUnmounted or call it explicitly.
     */
    function on(event: string | string[], handler: (payload: unknown) => void): () => void {
        const events = Array.isArray(event) ? event : [event];
        for (const e of events) {
            if (!entry.bus.has(e)) entry.bus.set(e, new Set());
            entry.bus.get(e)!.add(handler);
        }
        return () => {
            for (const e of events) entry.bus.get(e)?.delete(handler);
        };
    }

    /** Emit an event to the server. Silently ignored when not connected. */
    function emit(event: string, payload: unknown = {}): void {
        entry.socket?.emit(event, payload);
    }

    return {
        connectionState: readonly(entry.connectionState),
        connect,
        stop,
        on,
        emit,
    };
}

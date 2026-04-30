# Car Bookings — REST API & Real-Time Integration Guide

> **Audience:** Frontend engineers integrating the admin dashboard and the public booking form.
> **Base URL (production):** `https://api.backhaus.de/api/v1`
> **WebSocket URL (production):** `wss://api.backhaus.de`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Admin REST API](#2-admin-rest-api)
   - [Create Booking](#21-create-booking)
   - [List Bookings](#22-list-bookings)
   - [Get Single Booking](#23-get-single-booking)
   - [Update Booking](#24-update-booking)
   - [Delete Booking](#25-delete-booking)
   - [Bulk Delete](#26-bulk-delete)
3. [Public Booking API](#3-public-booking-api)
   - [CSRF Token Flow](#31-csrf-token-flow)
   - [Check Car Distance Eligibility](#32-check-car-distance-eligibility)
   - [Submit Public Booking](#33-submit-public-booking)
4. [WebSocket — Real-Time Events](#4-websocket--real-time-events)
   - [Connecting](#41-connecting)
   - [Client → Server Events](#42-client--server-events)
   - [Server → Client Events](#43-server--client-events)
5. [Presence System (Live Editing)](#5-presence-system-live-editing)
6. [TypeScript Payload Interfaces](#6-typescript-payload-interfaces)
7. [Error Reference](#7-error-reference)

---

## 1. Authentication

### Admin Dashboard (JWT Bearer)

All `/dashboard/*` endpoints require a valid JWT issued by the dashboard login flow.

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

The token must be for an admin who has either:
- `isSuperAdmin: true`, **or**
- `apps` array includes `"booking"`

### WebSocket (JWT via handshake)

The WebSocket connection authenticates using the same JWT in the Socket.IO **auth** object — **not** in `extraHeaders`. See [Section 4.1](#41-connecting).

### Public Booking (CSRF + Domain Guard)

Public endpoints (`/booking/*`) are protected by:
- A **domain guard** — requests must originate from the configured booking domain.
- A **CSRF token** — must be obtained via `GET /booking/csrf-token` and sent in the `X-Booking-CSRF-Token` header on every POST.
- A **rate limiter** — default 60 requests per 60 seconds per IP.

See [Section 3](#3-public-booking-api) for the full flow.

---

## 2. Admin REST API

Base path: `/api/v1/dashboard/booking/car-bookings`

---

### 2.1 Create Booking

```
POST /api/v1/dashboard/booking/car-bookings
```

**Status default:** Admin-created bookings default to `APPROVED` if `status` is omitted.

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <jwt_token>` |
| `Content-Type` | `application/json` |

**Request Body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `carId` | `string (UUID v4)` | ✅ | Must reference an existing car |
| `startsAt` | `string (ISO 8601)` | ✅ | Must be before `endsAt` |
| `endsAt` | `string (ISO 8601)` | ✅ | Must be after `startsAt` |
| `requesterName` | `string` | ✅ | Max 200 characters, trimmed |
| `requesterEmail` | `string` | ✅ | Valid email, max 320 chars, lowercased |
| `distance` | `integer` | ✅ | Minimum 2 |
| `status` | `CarBookingStatus` | ❌ | One of: `PENDING`, `APPROVED`, `REJECTED`, `CANCELED` |
| `groupId` | `string (UUID v4) \| null` | ❌ | Must reference an existing group |
| `requesterNote` | `string \| null` | ❌ | Max 2000 characters |
| `adminNote` | `string \| null` | ❌ | — |
| `safeReference` | `string` | ❌ | Max 200 chars — safe locker reference code |
| `safePin` | `string` | ❌ | Max 100 chars — safe locker PIN |

> `safeReference` and `safePin` are **admin-only fields**. They default to `null` when omitted. Never populate these from the public booking form.

**Example Request**

```json
{
  "carId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "startsAt": "2026-05-10T08:00:00.000Z",
  "endsAt": "2026-05-10T18:00:00.000Z",
  "requesterName": "Max Mustermann",
  "requesterEmail": "max@example.de",
  "distance": 150,
  "status": "APPROVED",
  "safeReference": "SCHRANK-42",
  "safePin": "1234"
}
```

**Response — 201 Created**

```json
{
  "success": true,
  "message": "dashboard.booking.car_bookings.success.created",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "carId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "startsAt": "2026-05-10T08:00:00.000Z",
    "endsAt": "2026-05-10T18:00:00.000Z",
    "status": "APPROVED",
    "requesterName": "Max Mustermann",
    "requesterEmail": "max@example.de",
    "distance": 150,
    "requesterNote": null,
    "adminNote": null,
    "groupId": null,
    "safeReference": "SCHRANK-42",
    "safePin": "1234",
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
}
```

**Realtime side-effect:** A `booking.created` event is broadcast to all subscribers.

---

### 2.2 List Bookings

```
GET /api/v1/dashboard/booking/car-bookings
```

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `page` | `integer` | Page number (default: 1) |
| `length` | `integer` | Items per page (default: 25) |
| `sort_by` | `string` | Field: `startsAt`, `endsAt`, `status`, `requesterName`, `requesterEmail`, `safeReference`, `createdAt`, `updatedAt` |
| `sort_dir` | `asc \| desc` | Sort direction (default: `desc`) |
| `search` | `string` | Full-text search on `requesterName`, `requesterEmail`, `safeReference` |
| `carId` | `UUID` | Filter by car |
| `status` | `CarBookingStatus` | Filter by status |
| `groupId` | `UUID` | Filter by group |
| `startsFrom` | `ISO 8601` | Bookings whose `endsAt` > this date |
| `endsBefore` | `ISO 8601` | Bookings whose `startsAt` < this date |

**Response — 200 OK** (Laravel-style pagination)

```json
{
  "success": true,
  "data": [ ...BookingListItem[] ],
  "meta": {
    "total": 120,
    "page": 1,
    "per_page": 25,
    "last_page": 5,
    "first_page_url": "...",
    "last_page_url": "...",
    "next_page_url": "...",
    "prev_page_url": null
  }
}
```

> List items omit no fields but return all columns from `listSelect` (no joins).

---

### 2.3 Get Single Booking

```
GET /api/v1/dashboard/booking/car-bookings/:id
```

**Response — 200 OK**

Returns the full `CarBooking` record including `safeReference`, `safePin`, and `adminNote`.

**Error — 404** if not found.

---

### 2.4 Update Booking

```
PATCH /api/v1/dashboard/booking/car-bookings/:id
```

All fields from `CreateCarBookingDto` are optional in the update. Only provided fields are changed.

**Constraints:**
- Cannot update a booking with `status: CANCELED`.
- If the resulting status is `APPROVED`, an approved-overlap check runs.
- If `carId` or date range changes, a maintenance-overlap check runs.

**Realtime side-effect:** A `booking.updated` event is broadcast to all subscribers.

---

### 2.5 Delete Booking

```
DELETE /api/v1/dashboard/booking/car-bookings/:id
```

**Response — 200 OK**

```json
{ "success": true }
```

**Realtime side-effect:** A `booking.deleted` event is broadcast to all subscribers.

**Error — 404** if not found.

---

### 2.6 Bulk Delete

```
POST /api/v1/dashboard/booking/car-bookings/delete-many
```

**Request Body**

```json
{ "ids": ["uuid-1", "uuid-2", "uuid-3"] }
```

**Response — 200 OK**

```json
{
  "success": true,
  "data": {
    "deletedCount": 2,
    "notFoundIds": ["uuid-3"]
  }
}
```

A `booking.deleted` event is emitted for each successfully deleted booking.

---

## 3. Public Booking API

Base path: `/api/v1/booking`

The public API is domain-restricted and CSRF-protected. All requests must come from the configured booking domain.

---

### 3.1 CSRF Token Flow

Before any POST request, the frontend must:

**Step 1 — Fetch the CSRF token**

```
GET /api/v1/booking/csrf-token
```

The response sets a cookie `XSRF-TOKEN-BOOKING` (readable by JS, `httpOnly: false`) and returns the token in the body. Headers are set to prevent caching.

```json
{
  "success": true,
  "data": {
    "csrfToken": "abc123token..."
  }
}
```

**Step 2 — Include the token on every POST**

```
X-Booking-CSRF-Token: abc123token...
```

> Read the token from the `XSRF-TOKEN-BOOKING` cookie or from the response body. Include it as a request header on all subsequent POST calls.

---

### 3.2 Check Car Distance Eligibility

```
POST /api/v1/booking/cars/check-distance
```

Returns cars eligible for the requested distance. Call this before showing the car selection to the user.

**Headers**

| Header | Value |
|---|---|
| `X-Booking-CSRF-Token` | `<csrf_token>` |
| `Content-Type` | `application/json` |

**Request Body**

```json
{ "distance": 120 }
```

**Response — 200 OK**

```json
{
  "success": true,
  "data": [ ...Car[] ]
}
```

---

### 3.3 Submit Public Booking

```
POST /api/v1/booking/cars
```

Creates a booking in `PENDING` status. Admin must approve it from the dashboard.

**Headers**

| Header | Value |
|---|---|
| `X-Booking-CSRF-Token` | `<csrf_token>` |
| `Content-Type` | `application/json` |

**Request Body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `carId` | `string (UUID v4)` | ✅ | Must reference an active car |
| `startsAt` | `string (ISO 8601)` | ✅ | Must be before `endsAt` |
| `endsAt` | `string (ISO 8601)` | ✅ | Must be after `startsAt` |
| `requesterName` | `string` | ✅ | Max 200 characters |
| `requesterEmail` | `string` | ✅ | Valid email, max 320 chars |
| `distance` | `integer` | ✅ | Minimum 2 |
| `requesterNote` | `string` | ✅ | Max 2000 characters |
| `groupId` | `string (UUID v4) \| null` | ❌ | — |

> Do **not** send `safeReference`, `safePin`, `adminNote`, or `status` — these are admin-only fields.

**Example Request**

```json
{
  "carId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "startsAt": "2026-05-10T08:00:00.000Z",
  "endsAt": "2026-05-10T18:00:00.000Z",
  "requesterName": "Max Mustermann",
  "requesterEmail": "max@example.de",
  "distance": 150,
  "requesterNote": "Bitte das große Fahrzeug."
}
```

**Response — 201 Created**

`safeReference` and `safePin` are stripped from the public response.

```json
{
  "success": true,
  "message": "booking.cars.booking_submitted",
  "data": {
    "id": "b2c3d4e5-...",
    "carId": "a1b2c3d4-...",
    "startsAt": "2026-05-10T08:00:00.000Z",
    "endsAt": "2026-05-10T18:00:00.000Z",
    "status": "PENDING",
    "requesterName": "Max Mustermann",
    "requesterEmail": "max@example.de",
    "distance": 150,
    "requesterNote": "Bitte das große Fahrzeug.",
    "adminNote": null,
    "groupId": null,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
}
```

**Realtime side-effect:** A `booking.created` event is broadcast to all subscribed admins.

---

## 4. WebSocket — Real-Time Events

### 4.1 Connecting

**Namespace:** `/dashboard-realtime`

**Production URL:** `wss://api.backhaus.de/dashboard-realtime`
**Local dev URL:** `ws://api.backhaus.local:3055/dashboard-realtime`

Authentication is passed in the Socket.IO **auth** object during the handshake. Do **not** use `extraHeaders` for the token — Socket.IO auth is the correct mechanism.

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('wss://api.backhaus.de', {
  path: '/socket.io',
  namespace: '/dashboard-realtime',  // appended to the URL automatically by socket.io-client
  transports: ['websocket'],
  auth: {
    token: 'Bearer eyJhbGci...',  // dashboard JWT
  },
});

// Correct usage:
const socket = io('wss://api.backhaus.de/dashboard-realtime', {
  transports: ['websocket'],
  auth: { token: 'Bearer eyJhbGci...' },
});
```

**Connection lifecycle:**

1. Client connects → server authenticates the JWT.
2. On auth failure: server emits `disconnect` immediately (`client.disconnect(true)`). Handle the `disconnect` event and redirect to login.
3. On auth success: socket is ready. Emit `booking:subscribe` to start receiving booking events.

```typescript
socket.on('connect', () => {
  socket.emit('booking:subscribe', {});
});

socket.on('disconnect', (reason) => {
  console.warn('Realtime disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Realtime auth failed:', err.message);
});
```

---

### 4.2 Client → Server Events

#### `booking:subscribe`

Join the booking room. Must be emitted after connecting before any server→client booking events will be received.

On successful subscription, the server immediately **replays the current presence state** for all bookings currently being edited — so late joiners know who is already in an edit session without waiting for the next change.

```typescript
socket.emit('booking:subscribe', {});

// Acknowledgement (optional)
socket.emit('booking:subscribe', {}, (response: { ok: true; room: string }) => {
  console.log('Joined room:', response.room);
});
```

**Payload:** `{}` (empty object)

**ACK Response:**
```typescript
{ ok: true; room: 'dashboard.booking.car-bookings' }
```

---

#### `booking:unsubscribe`

Leave the booking room. Booking lifecycle events will no longer be received after this.

```typescript
socket.emit('booking:unsubscribe', {});
```

**Payload:** `{}` (empty object)

**ACK Response:**
```typescript
{ ok: true; room: 'dashboard.booking.car-bookings' }
```

---

#### `booking:edit-start`

Notify other admins that you have opened a booking record for editing. Triggers a `booking.editors-changed` broadcast.

Emit this when the admin **opens** a booking detail view or edit modal.

```typescript
socket.emit('booking:edit-start', { bookingId: 'uuid-of-booking' });
```

**Payload:**
```typescript
{ bookingId: string }
```

> No acknowledgement is returned for this event.

---

#### `booking:edit-end`

Notify other admins that you have closed or saved a booking record. Triggers a `booking.editors-changed` broadcast.

Emit this when the admin **closes** the booking detail view, saves, or navigates away.

```typescript
socket.emit('booking:edit-end', { bookingId: 'uuid-of-booking' });
```

**Payload:**
```typescript
{ bookingId: string }
```

> If the socket disconnects without emitting `booking:edit-end`, the server automatically cleans up presence for all bookings that socket was editing.

---

### 4.3 Server → Client Events

#### `booking.created`

Emitted when any booking is created — by an admin or via the public form.

```typescript
socket.on('booking.created', (payload: BookingRealtimePayload) => {
  // Add to local state / refresh list
});
```

**Payload:** [`BookingRealtimePayload`](#bookingRealtimePayload)

---

#### `booking.updated`

Emitted when any booking field changes — including status changes (e.g., PENDING → APPROVED).

```typescript
socket.on('booking.updated', (payload: BookingRealtimePayload) => {
  // Update the matching item in local state
});
```

**Payload:** [`BookingRealtimePayload`](#bookingRealtimePayload)

---

#### `booking.deleted`

Emitted when a booking is deleted (single or bulk).

```typescript
socket.on('booking.deleted', (payload: BookingDeletedPayload) => {
  // Remove item from local state by payload.id
});
```

**Payload:**
```typescript
{ id: string }
```

---

#### `booking.editors-changed`

Emitted whenever the set of admins currently editing a specific booking changes. This is the core of the presence system.

Triggered by:
- `booking:edit-start` — an admin opens the booking
- `booking:edit-end` — an admin closes the booking
- Socket disconnect — the server auto-removes all presence for the disconnected admin

Also replayed on `booking:subscribe` (initial state sync).

```typescript
socket.on('booking.editors-changed', (payload: BookingEditorsChangedPayload) => {
  const { bookingId, editors } = payload;

  if (editors.length === 0) {
    // Nobody is editing this booking — allow editing
  } else {
    // Show "being edited by" indicator
    // editors[0].adminEmail etc.
  }
});
```

**Payload:**
```typescript
{
  bookingId: string;
  editors: Array<{
    adminId: string;
    adminEmail: string;
  }>;
}
```

> When `editors` is empty, the booking is not currently being edited.

---

## 5. Presence System (Live Editing)

The presence system prevents conflicting edits by broadcasting which admins currently have a booking record open.

### How it works

```
Admin A opens booking #123
  → emits booking:edit-start { bookingId: "123" }
  → server adds Admin A to presence map
  → server broadcasts booking.editors-changed { bookingId: "123", editors: [AdminA] }

Admin B receives booking.editors-changed
  → sees editors: [{ adminId: "...", adminEmail: "adminA@..." }]
  → marks booking #123 as read-only in UI

Admin A closes booking #123 (saves / navigates away)
  → emits booking:edit-end { bookingId: "123" }
  → server removes Admin A from presence map
  → server broadcasts booking.editors-changed { bookingId: "123", editors: [] }

Admin B receives booking.editors-changed
  → editors is empty → removes read-only indicator
```

### Initial State on Subscribe

When an admin subscribes with `booking:subscribe`, the server **immediately replays** the current presence state for all bookings currently being edited. This ensures late joiners are not left in the dark:

```typescript
socket.on('booking.editors-changed', (payload) => {
  // This fires once per actively-edited booking right after subscribe
  // — treat it the same as any other editors-changed event
});
```

### Auto-Cleanup on Disconnect

If an admin's browser tab closes or the connection drops, the server automatically:
1. Removes the admin from all presence maps.
2. Broadcasts `booking.editors-changed` for each booking they were editing.

No client-side cleanup is needed for crash scenarios.

### Recommended UI Pattern

```typescript
// In your booking list/detail component:

const editingAdmins = ref<Map<string, BookingEditorInfo[]>>(new Map());

socket.on('booking.editors-changed', ({ bookingId, editors }) => {
  if (editors.length === 0) {
    editingAdmins.value.delete(bookingId);
  } else {
    editingAdmins.value.set(bookingId, editors);
  }
});

// When rendering a row or opening a booking:
const isBeingEdited = (bookingId: string): boolean =>
  (editingAdmins.value.get(bookingId)?.length ?? 0) > 0;

const editorsOf = (bookingId: string): BookingEditorInfo[] =>
  editingAdmins.value.get(bookingId) ?? [];

// Emit presence events:
function onOpenBooking(bookingId: string) {
  socket.emit('booking:edit-start', { bookingId });
}

function onCloseBooking(bookingId: string) {
  socket.emit('booking:edit-end', { bookingId });
}
```

---

## 6. TypeScript Payload Interfaces

Copy these into your frontend types file.

```typescript
// ------------------------------------------------------------------
// Booking status
// ------------------------------------------------------------------
export type CarBookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

// ------------------------------------------------------------------
// Full booking record — used in booking.created and booking.updated
// ------------------------------------------------------------------
export interface BookingRealtimePayload {
  readonly id: string;
  readonly carId: string;
  readonly startsAt: string;          // ISO 8601 date string
  readonly endsAt: string;            // ISO 8601 date string
  readonly status: CarBookingStatus;
  readonly requesterName: string;
  readonly requesterEmail: string;
  readonly distance: number;
  readonly requesterNote: string | null;
  readonly adminNote: string | null;
  readonly groupId: string | null;
  readonly safeReference: string | null;
  readonly safePin: string | null;
  readonly createdAt: string;         // ISO 8601 date string
  readonly updatedAt: string;         // ISO 8601 date string
}

// ------------------------------------------------------------------
// Booking deleted — used in booking.deleted
// ------------------------------------------------------------------
export interface BookingDeletedPayload {
  readonly id: string;
}

// ------------------------------------------------------------------
// Editor info — used in booking.editors-changed
// ------------------------------------------------------------------
export interface BookingEditorInfo {
  readonly adminId: string;
  readonly adminEmail: string;
}

export interface BookingEditorsChangedPayload {
  readonly bookingId: string;
  readonly editors: readonly BookingEditorInfo[];
}

// ------------------------------------------------------------------
// Socket event map — for typed socket.io-client usage
// ------------------------------------------------------------------
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

// Typed socket usage (socket.io-client v4+):
// import { Socket } from 'socket.io-client';
// const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(...);
```

---

## 7. Error Reference

### HTTP Error Codes

| Status | When |
|---|---|
| `400` | Date range invalid (`startsAt >= endsAt`), booking is already `CANCELED` and cannot be updated |
| `401` | Missing or invalid JWT |
| `403` | Admin does not have the `booking` app permission |
| `404` | Booking not found, car not found, group not found |
| `409` | Approved booking overlap, car under maintenance during requested period |
| `422` | Invalid date range (business logic) |
| `429` | Rate limit exceeded (public API only) |

### i18n Error Keys

| Key | Meaning |
|---|---|
| `dashboard.booking.car_bookings.errors.not_found` | Booking record not found |
| `dashboard.booking.car_bookings.errors.cannot_update_canceled` | Cannot modify a canceled booking |
| `dashboard.booking.car_bookings.errors.invalid_range` | `startsAt` must be before `endsAt` |
| `dashboard.booking.car_bookings.errors.car_not_found` | Car with given `carId` does not exist |
| `dashboard.booking.car_bookings.errors.group_not_found` | Group with given `groupId` does not exist |
| `dashboard.booking.car_bookings.errors.approved_overlap` | The time slot conflicts with an existing approved booking for the same car |
| `dashboard.booking.car_bookings.errors.car_under_maintenance` | The car has a scheduled maintenance window during the requested period |

### WebSocket Errors

| Scenario | Behavior |
|---|---|
| Invalid or expired JWT | Connection rejected immediately; socket disconnected with `true` (permanent) |
| Admin lacks `booking` app | `booking:subscribe`, `booking:edit-start`, `booking:edit-end` throw `WsException("Access denied. Booking app permission required.")` |
| Missing authentication | `WsException("Authentication required")` on any room/presence event |

### Maintenance Conflict (409)

When a car has a maintenance window that overlaps with the requested booking period, the API returns 409 with:

```json
{
  "statusCode": 409,
  "message": "dashboard.booking.car_bookings.errors.car_under_maintenance"
}
```

This applies to **both** admin create/update and the public booking form. No booking can be created for a car during its maintenance period, regardless of booking status.

---

## Appendix: Full Connection Example (Nuxt / Vue 3)

```typescript
// composables/useBookingRealtime.ts
import { io, type Socket } from 'socket.io-client';
import { ref, onUnmounted } from 'vue';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  BookingRealtimePayload,
  BookingDeletedPayload,
  BookingEditorsChangedPayload,
} from '~/types/booking-realtime';

export function useBookingRealtime(token: string) {
  const editingMap = ref<Map<string, { adminId: string; adminEmail: string }[]>>(new Map());

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    'wss://api.backhaus.de/dashboard-realtime',
    {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
    },
  );

  socket.on('connect', () => {
    socket.emit('booking:subscribe', {});
  });

  socket.on('connect_error', (err) => {
    console.error('[realtime] connection error:', err.message);
  });

  socket.on('booking.editors-changed', ({ bookingId, editors }: BookingEditorsChangedPayload) => {
    if (editors.length === 0) {
      editingMap.value.delete(bookingId);
    } else {
      editingMap.value.set(bookingId, [...editors]);
    }
  });

  const onCreated = (handler: (p: BookingRealtimePayload) => void) =>
    socket.on('booking.created', handler);

  const onUpdated = (handler: (p: BookingRealtimePayload) => void) =>
    socket.on('booking.updated', handler);

  const onDeleted = (handler: (p: BookingDeletedPayload) => void) =>
    socket.on('booking.deleted', handler);

  function startEditing(bookingId: string) {
    socket.emit('booking:edit-start', { bookingId });
  }

  function stopEditing(bookingId: string) {
    socket.emit('booking:edit-end', { bookingId });
  }

  function isBeingEdited(bookingId: string): boolean {
    return (editingMap.value.get(bookingId)?.length ?? 0) > 0;
  }

  function editorsOf(bookingId: string) {
    return editingMap.value.get(bookingId) ?? [];
  }

  onUnmounted(() => {
    socket.emit('booking:unsubscribe', {});
    socket.disconnect();
  });

  return { editingMap, onCreated, onUpdated, onDeleted, startEditing, stopEditing, isBeingEdited, editorsOf };
}
```

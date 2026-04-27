# Car Bookings API (Dashboard Booking)

This document covers all current APIs for **booking a car**.

- Base route: `dashboard/booking/car-bookings`
- Auth: `JwtAuthGuard` + `AdminGuard`
- App permission: `@RequireApps(['booking'])`
- Content type: `application/json`
- Optional language header: `x-app-lang: en | de` (default `de`)

---

## Status Options

Allowed status values:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELED`

### Status behavior

- **Create from dashboard API**: if `status` is omitted, backend defaults to `APPROVED`.
- `PENDING`, `REJECTED`, `CANCELED` can overlap in time for the same car.
- `APPROVED` bookings for the same car **must not overlap**.
- A booking that is already `CANCELED` cannot be updated (`cannot_update_canceled`).

---

## Booking Entity

Main fields:

- `id: string` (UUID)
- `carId: string` (UUID)
- `startsAt: string` (ISO datetime)
- `endsAt: string` (ISO datetime)
- `status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED'`
- `requesterName: string`
- `requesterEmail: string`
- `distance: number` (integer, `> 1`)
- `requesterNote: string | null`
- `adminNote: string | null`
- `groupId: string | null`
- `safeReference: string`
- `safePin: string`
- `createdAt: string` (ISO datetime)
- `updatedAt: string` (ISO datetime)

---

## Validation and Logic

### Date range

- `startsAt` and `endsAt` must be valid dates.
- Business rule: `startsAt < endsAt`, otherwise `invalid_range`.

### FK checks

- `carId` must exist, otherwise `car_not_found`.
- `groupId` (if provided and not null) must exist, otherwise `group_not_found`.
- `groupId` is optional for both create and update.

### Overlap rule

- For resulting `status = APPROVED`, backend checks overlap:
  - existing `endsAt > new.startsAt`
  - existing `startsAt < new.endsAt`
  - same `carId`
- If admin changes `carId` in update and resulting status is `APPROVED`, free-slot overlap check runs on the **new car** for the requested range.
- DB exclusion constraint also enforces this to avoid race conditions.

### List masking

- List endpoint intentionally excludes `safePin`.
- Get-by-id and create/update responses include `safePin`.
- List endpoint includes: `distance`, `requesterNote`, `adminNote`.

### Realtime updates (Socket.IO)

- Namespace: `/dashboard-realtime`
- Room/channel: `dashboard.booking.car-bookings`
- Subscribe event: `booking:subscribe`
- Unsubscribe event: `booking:unsubscribe`
- Server broadcast event (on successful create): `booking.created`
- Auth: same dashboard bearer token used by HTTP APIs
- Authorization: admin must have `booking` app access (or be super admin)

Frontend subscription flow:

1. Connect to namespace `/dashboard-realtime` with dashboard bearer token.
2. Emit `booking:subscribe` to join room `dashboard.booking.car-bookings`.
3. Listen for `booking.created` and prepend/append record in list state.
4. Emit `booking:unsubscribe` on page leave or when list module unmounts.

Socket auth examples:

- `handshake.auth.token`: `Bearer <access_token>` (recommended)
- or header: `Authorization: Bearer <access_token>`

Minimal client example:

```ts
import { io } from 'socket.io-client';

const socket = io('https://YOUR_API_HOST/dashboard-realtime', {
  auth: { token: `Bearer ${accessToken}` },
});

socket.emit('booking:subscribe', {});

socket.on('booking.created', (payload) => {
  // Update booking listing state
  // payload has list-safe fields and excludes safePin
});

// Cleanup
socket.emit('booking:unsubscribe', {});
socket.disconnect();
```

`booking.created` payload (list-safe, excludes `safePin`):

```json
{
  "id": "2d16e552-cd73-43d7-9c67-7a0ea7b68cd9",
  "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
  "startsAt": "2026-04-25T09:00:00.000Z",
  "endsAt": "2026-04-25T11:00:00.000Z",
  "status": "APPROVED",
  "requesterName": "John Doe",
  "requesterEmail": "john@example.com",
  "distance": 25,
  "requesterNote": "Could be delayed by 10 minutes",
  "adminNote": null,
  "groupId": null,
  "safeReference": "Safe A / Slot 3",
  "createdAt": "2026-04-23T12:00:00.000Z",
  "updatedAt": "2026-04-23T12:00:00.000Z"
}
```

---

## Endpoints

## 1) Create Car Booking

**POST** `/dashboard/booking/car-bookings`

### Request body (required fields)

```json
{
  "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
  "startsAt": "2026-04-25T09:00:00.000Z",
  "endsAt": "2026-04-25T11:00:00.000Z",
  "distance": 12,
  "requesterName": "John Doe",
  "requesterEmail": "john@example.com",
  "requesterNote": "Please prepare EV charging card",
  "safeReference": "Safe A / Slot 3",
  "safePin": "4931"
}
```

### Request body (with optional fields)

```json
{
  "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
  "startsAt": "2026-04-25T09:00:00.000Z",
  "endsAt": "2026-04-25T11:00:00.000Z",
  "distance": 25,
  "status": "PENDING",
  "requesterName": "John Doe",
  "requesterEmail": "john@example.com",
  "groupId": "e2f70428-c21c-4f13-9b61-a4476a6b1d95",
  "requesterNote": "Could be delayed by 10 minutes",
  "safeReference": "Safe A / Slot 3",
  "safePin": "4931"
}
```

### Field rules

- `carId`: required UUID v4
- `startsAt`: required valid date
- `endsAt`: required valid date
- `status`: optional enum (`PENDING | APPROVED | REJECTED | CANCELED`)
- `requesterName`: required string, trimmed, max 200
- `requesterEmail`: required valid email, lowercased, max 320
- `distance`: required integer, must be greater than 1
- `groupId`: optional UUID v4 (or omitted/null)
- `requesterNote`: optional string, trimmed (textarea)
- `safeReference`: required string, trimmed, max 200
- `safePin`: required string, trimmed, max 100

### Success response (status omitted -> APPROVED)

```json
{
  "success": true,
  "message": "Car booking created successfully",
  "data": {
    "id": "2d16e552-cd73-43d7-9c67-7a0ea7b68cd9",
    "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
    "startsAt": "2026-04-25T09:00:00.000Z",
    "endsAt": "2026-04-25T11:00:00.000Z",
    "status": "APPROVED",
    "requesterName": "John Doe",
    "requesterEmail": "john@example.com",
    "distance": 25,
    "requesterNote": "Could be delayed by 10 minutes",
    "adminNote": null,
    "groupId": null,
    "safeReference": "Safe A / Slot 3",
    "safePin": "4931",
    "createdAt": "2026-04-23T12:00:00.000Z",
    "updatedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

---

## 1.1) Booking Status Select List (for dropdowns)

Use this endpoint to build status dropdown options and disable the current status in edit UI.

**GET** `/dashboard/shared/select-lists/car-booking-statuses`

### Query params

- `currentStatus` (optional): `PENDING | APPROVED | REJECTED | CANCELED`

### Example

`GET /dashboard/shared/select-lists/car-booking-statuses?currentStatus=APPROVED`

### Success response

```json
{
  "success": true,
  "message": "Car booking statuses retrieved successfully",
  "data": [
    { "value": "PENDING", "label": "Pending", "disabled": false },
    { "value": "APPROVED", "label": "Approved", "disabled": true },
    { "value": "REJECTED", "label": "Rejected", "disabled": false },
    { "value": "CANCELED", "label": "Canceled", "disabled": false }
  ]
}
```

### Validation error

- Invalid `currentStatus` -> `400 Bad Request`

---

## 2) List Car Bookings (Paginated)

**GET** `/dashboard/booking/car-bookings`

### Query params

- `page` (optional, default `1`, min `1`)
- `length` (optional, default `25`, min `1`, max `100`)
- `search` (optional; searches `requesterName`, `requesterEmail`, `safeReference`)
- `sort_by` (optional; default `startsAt`)
- `sort_dir` (optional; `asc | desc`, default `desc`)
- `carId` (optional UUID)
- `status` (optional enum)
- `groupId` (optional UUID)
- `startsFrom` (optional date; filters bookings where `endsAt > startsFrom`)
- `endsBefore` (optional date; filters bookings where `startsAt < endsBefore`)

Allowed `sort_by` values:

- `startsAt`
- `endsAt`
- `status`
- `requesterName`
- `requesterEmail`
- `safeReference`
- `createdAt`
- `updatedAt`

### Example

`GET /dashboard/booking/car-bookings?page=1&length=20&carId=6ec0d225-9a21-4be8-9a8e-3b094b9e6b56&status=APPROVED&startsFrom=2026-04-25T00:00:00.000Z&endsBefore=2026-04-26T00:00:00.000Z`

### Success response

```json
{
  "success": true,
  "message": "Car bookings retrieved successfully",
  "data": {
    "data": [
      {
        "id": "2d16e552-cd73-43d7-9c67-7a0ea7b68cd9",
        "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
        "startsAt": "2026-04-25T09:00:00.000Z",
        "endsAt": "2026-04-25T11:00:00.000Z",
        "status": "APPROVED",
        "requesterName": "John Doe",
        "requesterEmail": "john@example.com",
        "distance": 25,
        "requesterNote": "Could be delayed by 10 minutes",
        "adminNote": null,
        "groupId": null,
        "safeReference": "Safe A / Slot 3",
        "createdAt": "2026-04-23T12:00:00.000Z",
        "updatedAt": "2026-04-23T12:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "perPage": 20,
      "currentPage": 1,
      "lastPage": 1,
      "from": 1,
      "to": 1
    },
    "links": {
      "first": null,
      "last": null,
      "prev": null,
      "next": null
    }
  }
}
```

---

## 3) Get Booking by ID

**GET** `/dashboard/booking/car-bookings/:id`

### Path param

- `id`: booking UUID

### Success response

```json
{
  "success": true,
  "message": "Car booking retrieved successfully",
  "data": {
    "id": "2d16e552-cd73-43d7-9c67-7a0ea7b68cd9",
    "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
    "startsAt": "2026-04-25T09:00:00.000Z",
    "endsAt": "2026-04-25T11:00:00.000Z",
    "status": "APPROVED",
    "requesterName": "John Doe",
    "requesterEmail": "john@example.com",
    "distance": 25,
    "requesterNote": "Could be delayed by 10 minutes",
    "adminNote": null,
    "groupId": null,
    "safeReference": "Safe A / Slot 3",
    "safePin": "4931",
    "createdAt": "2026-04-23T12:00:00.000Z",
    "updatedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

---

## 4) Update Booking

**PATCH** `/dashboard/booking/car-bookings/:id`

### Path param

- `id`: booking UUID

### Update payload example

```json
{
  "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
  "startsAt": "2026-04-25T10:00:00.000Z",
  "endsAt": "2026-04-25T12:00:00.000Z",
  "distance": 42,
  "status": "REJECTED",
  "requesterName": "John D.",
  "requesterEmail": "john.d@example.com",
  "groupId": "e2f70428-c21c-4f13-9b61-a4476a6b1d95",
  "requesterNote": "Need a child seat",
  "adminNote": "Rejected due to schedule conflict",
  "safeReference": "Safe B / Slot 2",
  "safePin": "7284"
}
```

### Field rules

All fields are optional:

- `carId`: UUID
- `startsAt`: date
- `endsAt`: date
- `distance`: integer, must be greater than 1
- `status`: enum (`PENDING | APPROVED | REJECTED | CANCELED`)
- `requesterName`: string, max 200
- `requesterEmail`: valid email, max 320
- `groupId`: UUID or `null` (optional; set `null` to clear group)
- `requesterNote`: optional string
- `adminNote`: optional string
- `safeReference`: string, max 200
- `safePin`: string, max 100

### Important update logic

- Existing booking in `CANCELED` status cannot be updated.
- If resulting status is `APPROVED`, overlap check runs.
- If `carId` changes and resulting status is `APPROVED`, overlap check runs against the target car and requested interval.

### Success response

```json
{
  "success": true,
  "message": "Car booking updated successfully",
  "data": {
    "id": "2d16e552-cd73-43d7-9c67-7a0ea7b68cd9",
    "carId": "6ec0d225-9a21-4be8-9a8e-3b094b9e6b56",
    "startsAt": "2026-04-25T10:00:00.000Z",
    "endsAt": "2026-04-25T12:00:00.000Z",
    "status": "REJECTED",
    "requesterName": "John D.",
    "requesterEmail": "john.d@example.com",
    "distance": 42,
    "requesterNote": "Need a child seat",
    "adminNote": "Rejected due to schedule conflict",
    "groupId": "e2f70428-c21c-4f13-9b61-a4476a6b1d95",
    "safeReference": "Safe B / Slot 2",
    "safePin": "7284",
    "createdAt": "2026-04-23T12:00:00.000Z",
    "updatedAt": "2026-04-23T12:15:00.000Z"
  }
}
```

---

## 5) Delete Booking

**DELETE** `/dashboard/booking/car-bookings/:id`

### Success response

```json
{
  "success": true,
  "message": "Car booking deleted successfully"
}
```

---

## 6) Delete Many Bookings

**POST** `/dashboard/booking/car-bookings/delete-many`

### Request body

```json
{
  "ids": [
    "2d16e552-cd73-43d7-9c67-7a0ea7b68cd9",
    "e95df8fd-4ed5-46c8-b4d7-8d0117e4f260"
  ]
}
```

### Validation

- `ids` must be a non-empty array
- each element must be a UUID v4

### Success response (all deleted)

```json
{
  "success": true,
  "message": "Successfully deleted 2 car booking(s)",
  "data": {
    "deletedCount": 2,
    "notFoundIds": []
  }
}
```

### Success response (partial)

```json
{
  "success": true,
  "message": "Deleted 1 car booking(s). 1 booking(s) not found.",
  "data": {
    "deletedCount": 1,
    "notFoundIds": ["e95df8fd-4ed5-46c8-b4d7-8d0117e4f260"]
  }
}
```

---

## Common Error Keys

- `dashboard.booking.car_bookings.errors.not_found`
- `dashboard.booking.car_bookings.errors.car_not_found`
- `dashboard.booking.car_bookings.errors.group_not_found`
- `dashboard.booking.car_bookings.errors.invalid_range`
- `dashboard.booking.car_bookings.errors.approved_overlap`
- `dashboard.booking.car_bookings.errors.cannot_update_canceled`

---

## i18n Success Keys

- `dashboard.booking.car_bookings.success.created`
- `dashboard.booking.car_bookings.success.retrieved`
- `dashboard.booking.car_bookings.success.updated`
- `dashboard.booking.car_bookings.success.deleted`
- `dashboard.booking.car_bookings.success.list_retrieved`


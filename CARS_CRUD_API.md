# Cars CRUD API (Dashboard Booking)

This document covers the **Cars CRUD only**.

- Base route: `dashboard/booking/cars`
- Auth: `JwtAuthGuard` + `AdminGuard`
- App permission: `@RequireApps(['booking'])`
- Content type: `application/json`
- Optional language header: `x-app-lang: en | de` (default `de`)

---

## Car Entity

Returned car fields:

- `id: string` (UUID)
- `model: string` (max 100 chars)
- `plateNumber: string` (max 10 chars, unique, normalized to uppercase)
- `type: 'petrol' | 'diesel' | 'electric' | 'hybrid'`
- `automatic: boolean`
- `max: number | null`
- `createdAt: string` (ISO datetime)
- `updatedAt: string` (ISO datetime)

---

## Business Logic and Validation

### Type and max rule

- If `type` is `electric` or `hybrid`:
  - `max` is required
  - must be an integer between `1` and `999999`
- If `type` is `petrol` or `diesel`:
  - `max` must be `null` or omitted

This is validated in service and enforced in DB check constraints.

### Input normalization

- `model`: `.trim()`
- `plateNumber`: `.trim().toUpperCase()`
- `automatic`: defaults to `false` on create if omitted

### Error mapping

- Duplicate `plateNumber` -> `dashboard.booking.cars.errors.plate_exists`
- Car not found -> `dashboard.booking.cars.errors.not_found`
- Invalid `max` rule -> one of:
  - `dashboard.booking.cars.errors.max_required_for_electric_hybrid`
  - `dashboard.booking.cars.errors.max_must_be_null_for_fuel_types`

---

## Endpoints

## 1) Create Car

**POST** `/dashboard/booking/cars`

### Request body

```json
{
  "model": "Tesla Model 3",
  "plateNumber": "b-ev123",
  "type": "electric",
  "automatic": true,
  "max": 530
}
```

### Validation

- `model`: required string, max 100
- `plateNumber`: required string, max 10
- `type`: required enum (`petrol | diesel | electric | hybrid`)
- `automatic`: optional boolean
- `max`: conditional by `type` (see business rules)

### Success response

```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "id": "a2fdfe58-4dc8-4d28-86d0-d652e12bf4ec",
    "model": "Tesla Model 3",
    "plateNumber": "B-EV123",
    "type": "electric",
    "automatic": true,
    "max": 530,
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:00:00.000Z"
  }
}
```

---

## 2) List Cars (Paginated)

**GET** `/dashboard/booking/cars`

### Query params

- `page` (optional, default `1`, min `1`)
- `length` (optional, default `25`, min `1`, max `100`)
- `search` (optional; searches `model`, `plateNumber`)
- `sort_by` (optional; default `createdAt`)
- `sort_dir` (optional; `asc | desc`, default `desc`)

Allowed `sort_by` values:

- `model`
- `plateNumber`
- `type`
- `automatic`
- `max`
- `createdAt`
- `updatedAt`

### Example

`GET /dashboard/booking/cars?page=1&length=25&search=tesla&sort_by=createdAt&sort_dir=desc`

### Success response (Laravel-style pagination wrapper)

```json
{
  "success": true,
  "message": "Cars retrieved successfully",
  "data": {
    "data": [
      {
        "id": "a2fdfe58-4dc8-4d28-86d0-d652e12bf4ec",
        "model": "Tesla Model 3",
        "plateNumber": "B-EV123",
        "type": "electric",
        "automatic": true,
        "max": 530,
        "createdAt": "2026-04-23T00:00:00.000Z",
        "updatedAt": "2026-04-23T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "perPage": 25,
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

## 3) Get Car by ID

**GET** `/dashboard/booking/cars/:id`

### Path param

- `id`: car UUID

### Success response

```json
{
  "success": true,
  "message": "Car retrieved successfully",
  "data": {
    "id": "a2fdfe58-4dc8-4d28-86d0-d652e12bf4ec",
    "model": "Tesla Model 3",
    "plateNumber": "B-EV123",
    "type": "electric",
    "automatic": true,
    "max": 530,
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:00:00.000Z"
  }
}
```

---

## 4) Update Car

**PATCH** `/dashboard/booking/cars/:id`

### Path param

- `id`: car UUID

### Request body (all fields optional)

```json
{
  "model": "Model Y",
  "plateNumber": "b-ev456",
  "type": "hybrid",
  "automatic": true,
  "max": 620
}
```

### Notes

- Partial updates are supported.
- Resulting `(type, max)` combination is validated against the same rules.
- To clear `max` when changing to petrol/diesel, send `"max": null`.

### Success response

```json
{
  "success": true,
  "message": "Car updated successfully",
  "data": {
    "id": "a2fdfe58-4dc8-4d28-86d0-d652e12bf4ec",
    "model": "Model Y",
    "plateNumber": "B-EV456",
    "type": "hybrid",
    "automatic": true,
    "max": 620,
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:05:00.000Z"
  }
}
```

---

## 5) Delete Car

**DELETE** `/dashboard/booking/cars/:id`

### Path param

- `id`: car UUID

### Success response

```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

---

## 6) Delete Many Cars

**POST** `/dashboard/booking/cars/delete-many`

### Request body

```json
{
  "ids": [
    "a2fdfe58-4dc8-4d28-86d0-d652e12bf4ec",
    "8fda8f78-5e3c-4e26-8f65-ff7af56f5479"
  ]
}
```

### Validation

- `ids`: required array
- minimum 1 item
- each item must be a valid UUID

### Success response (all deleted)

```json
{
  "success": true,
  "message": "Successfully deleted 2 cars",
  "data": {
    "deletedCount": 2,
    "notFoundIds": []
  }
}
```

### Success response (partial delete)

```json
{
  "success": true,
  "message": "Deleted 1 cars. 1 cars not found.",
  "data": {
    "deletedCount": 1,
    "notFoundIds": ["8fda8f78-5e3c-4e26-8f65-ff7af56f5479"]
  }
}
```

---

## Common Error Responses

Actual HTTP error wrapper may include fields like `statusCode`, `timestamp`, and `path` from global filters.

Typical logical errors:

- Not found:
  - key: `dashboard.booking.cars.errors.not_found`
- Duplicate plate:
  - key: `dashboard.booking.cars.errors.plate_exists`
- Invalid type/max relation:
  - key: `dashboard.booking.cars.errors.max_required_for_electric_hybrid`
  - key: `dashboard.booking.cars.errors.max_must_be_null_for_fuel_types`

---

## i18n Keys Used

Success keys:

- `dashboard.booking.cars.success.created`
- `dashboard.booking.cars.success.retrieved`
- `dashboard.booking.cars.success.updated`
- `dashboard.booking.cars.success.deleted`
- `dashboard.booking.cars.success.list_retrieved`

Error keys:

- `dashboard.booking.cars.errors.not_found`
- `dashboard.booking.cars.errors.plate_exists`
- `dashboard.booking.cars.errors.max_required_for_electric_hybrid`
- `dashboard.booking.cars.errors.max_must_be_null_for_fuel_types`


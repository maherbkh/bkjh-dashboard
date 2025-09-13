# Event Targets API Documentation

## Overview
This module provides CRUD operations for managing event targets in the academy system. Event targets define the audience or group of people that events are designed for.

## Base URL
```
/api/v1/dashboard/academy/event-targets
```

## Authentication
All endpoints require JWT authentication and admin privileges with 'academy' app access.

## API Endpoints

### 1. Create Event Target
**POST** `/api/v1/dashboard/academy/event-targets`

Creates a new event target.

#### Request Body
```json
{
  "code": "EMP",
  "name": "Employees",
  "slug": "employees",
  "position": 1
}
```

#### Request Body Parameters
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `code` | string | Yes | 10 | Unique identifier (uppercase letters, numbers, underscores only) |
| `name` | string | Yes | 100 | Display name of the target |
| `slug` | string | No | 100 | URL-friendly identifier (auto-generated from name if not provided) |
| `position` | number | No | - | Position for ordering (minimum: 0) |

#### Response
```json
{
  "id": "uuid-string",
  "name": "Employees",
  "position": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `201` - Event target created successfully
- `409` - Event target with this code already exists
- `400` - Validation error

---

### 2. Get All Event Targets
**GET** `/api/v1/dashboard/academy/event-targets`

Retrieves all event targets with filtering and pagination.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (minimum: 1) |
| `limit` | number | No | 10 | Items per page (1-100) |
| `search` | string | No | - | Search term to filter results |
| `sortBy` | string | No | name | Sort field (code, name, slug, createdAt, updatedAt) |
| `sortOrder` | string | No | desc | Sort order (asc, desc) |

#### Example Request
```
GET /api/v1/dashboard/academy/event-targets?page=1&limit=10&search=emp&sortBy=name&sortOrder=asc
```

#### Response
```json
{
  "data": [
    {
      "id": "uuid-string",
      "code": "EMP",
      "name": "Employees",
      "slug": "employees",
      "position": 1,
      "eventsCount": 3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Status Codes
- `200` - Event targets retrieved successfully

---

### 3. Get Event Targets Statistics
**GET** `/api/v1/dashboard/academy/event-targets/stats`

Retrieves statistics about event targets.

#### Response
```json
{
  "total": 5,
  "withEvents": 3,
  "withoutEvents": 2
}
```

#### Status Codes
- `200` - Statistics retrieved successfully

---

### 4. Get All Event Targets for Selection
**GET** `/api/v1/dashboard/academy/event-targets/selection`

Retrieves all event targets for selection purposes (e.g., in dropdowns).

#### Response
```json
[
  {
    "id": "uuid-string",
    "code": "EMP",
    "name": "Employees"
  },
  {
    "id": "uuid-string-2",
    "code": "MGR",
    "name": "Managers"
  }
]
```

#### Status Codes
- `200` - Event targets for selection retrieved successfully

---

### 5. Get Event Target by ID
**GET** `/api/v1/dashboard/academy/event-targets/:id`

Retrieves a specific event target by its ID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event target UUID |

#### Response
```json
{
  "id": "uuid-string",
  "code": "EMP",
  "name": "Employees",
  "slug": "employees",
  "position": 1,
  "events": [
    {
      "id": "event-uuid-1",
      "title": "Employee Training"
    }
  ],
  "eventsCount": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `200` - Event target retrieved successfully
- `404` - Event target not found

---

### 6. Update Event Target
**PATCH** `/api/v1/dashboard/academy/event-targets/:id`

Updates an existing event target.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event target UUID |

#### Request Body
```json
{
  "name": "Updated Employees",
  "position": 2
}
```

#### Request Body Parameters
All fields are optional (partial update):
| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `code` | string | 10 | Unique identifier |
| `name` | string | 100 | Display name |
| `slug` | string | 100 | URL-friendly identifier |
| `position` | number | - | Position for ordering |

#### Response
```json
{
  "id": "uuid-string",
  "code": "EMP",
  "name": "Updated Employees",
  "slug": "updated-employees",
  "position": 2,
  "eventsCount": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `200` - Event target updated successfully
- `404` - Event target not found
- `409` - Event target with this code already exists
- `400` - Validation error

---

### 7. Delete Event Target
**DELETE** `/api/v1/dashboard/academy/event-targets/:id`

Deletes an event target.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event target UUID |

#### Response
```json
{
  "message": "Event target deleted successfully"
}
```

#### Status Codes
- `200` - Event target deleted successfully
- `404` - Event target not found
- `409` - Cannot delete event target that is associated with events

---

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "Code must contain only uppercase letters, numbers, and underscores",
    "Name is required"
  ],
  "error": "Bad Request"
}
```

### Not Found Error (404)
```json
{
  "statusCode": 404,
  "message": "Event target not found",
  "error": "Not Found"
}
```

### Conflict Error (409)
```json
{
  "statusCode": 409,
  "message": "Event target with this code already exists",
  "error": "Conflict"
}
```

## Notes
- All timestamps are in ISO 8601 format
- The `position` field is used for ordering targets (default: 0)
- Event targets with associated events cannot be deleted
- The `slug` field is auto-generated from the name if not provided
- Code validation ensures only uppercase letters, numbers, and underscores
- Slug validation ensures only lowercase letters, numbers, and hyphens
- Both `code` and `slug` fields must be unique
- Event targets don't have an `isActive` field (unlike event categories)
- The `eventsCount` field shows the number of events associated with each target

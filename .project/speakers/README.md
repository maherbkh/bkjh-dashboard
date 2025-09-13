# Dashboard Academy - Speakers API Documentation

## Overview
This module provides comprehensive speaker management functionality for the Academy system, including CRUD operations, filtering, pagination, and statistics.

## Base URL
```
/api/v1/dashboard/academy/speakers
```

## Authentication
- **Required:** Bearer Token (JWT)
- **Guard:** JWT Authentication + Admin Guard
- **App Access:** Academy module access required

---

## API Endpoints

### 1. Create Speaker
**POST** `/api/v1/dashboard/academy/speakers`

Creates a new speaker in the system.

#### Request Body
```json
{
  "name": "Dr. John Smith",
  "qualification": "PhD in Computer Science, Senior Software Engineer",
  "isActive": true
}
```

#### Request Body Schema
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | Yes | Speaker name (max 100 chars) | "Dr. John Smith" |
| `qualification` | string | No | Speaker qualification (max 500 chars) | "PhD in Computer Science" |
| `isActive` | boolean | No | Whether speaker is active (default: true) | true |

#### Response
**Status:** `201 Created`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Dr. John Smith",
  "qualification": "PhD in Computer Science, Senior Software Engineer",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Error Responses
- **409 Conflict:** Speaker with this name already exists
- **400 Bad Request:** Validation errors

---

### 2. Get All Speakers
**GET** `/api/v1/dashboard/academy/speakers`

Retrieves all speakers with filtering, pagination, and sorting.

#### Query Parameters
| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `page` | number | No | 1 | Page number | 1 |
| `length` | number | No | 25 | Items per page | 25 |
| `search` | string | No | - | Search in name and qualification | "john" |
| `isActive` | boolean | No | - | Filter by active status | true |
| `sort_by` | string | No | "name" | Sort field | "name" |
| `sort_dir` | string | No | "desc" | Sort direction | "desc" |

#### Valid Sort Fields
- `name` - Speaker name
- `qualification` - Speaker qualification
- `isActive` - Active status
- `createdAt` - Creation date
- `updatedAt` - Last update date

#### Response
**Status:** `200 OK`

```json
{
  "status": true,
  "message": "Speakers retrieved successfully",
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Dr. John Smith",
        "qualification": "PhD in Computer Science, Senior Software Engineer",
        "isActive": true,
        "eventsCount": 5,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 3. Get Speaker by ID
**GET** `/api/v1/dashboard/academy/speakers/:id`

Retrieves a specific speaker by ID with associated events.

#### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Speaker UUID | "123e4567-e89b-12d3-a456-426614174000" |

#### Response
**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Dr. John Smith",
  "qualification": "PhD in Computer Science, Senior Software Engineer",
  "isActive": true,
  "eventsCount": 2,
  "events": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "title": "Advanced JavaScript Workshop",
      "type": "IN_PERSON",
      "isActive": true
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Error Responses
- **404 Not Found:** Speaker not found

---

### 4. Update Speaker
**PATCH** `/api/v1/dashboard/academy/speakers/:id`

Updates an existing speaker.

#### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Speaker UUID | "123e4567-e89b-12d3-a456-426614174000" |

#### Request Body
```json
{
  "name": "Dr. John Smith Updated",
  "qualification": "PhD in Computer Science, Senior Software Engineer, Updated",
  "isActive": false
}
```

#### Request Body Schema
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | No | Speaker name (max 100 chars) | "Dr. John Smith" |
| `qualification` | string | No | Speaker qualification (max 500 chars) | "PhD in Computer Science" |
| `isActive` | boolean | No | Whether speaker is active | true |

#### Response
**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Dr. John Smith Updated",
  "qualification": "PhD in Computer Science, Senior Software Engineer, Updated",
  "isActive": false,
  "eventsCount": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

#### Error Responses
- **404 Not Found:** Speaker not found
- **409 Conflict:** Speaker with this name already exists
- **400 Bad Request:** Validation errors

---

### 5. Toggle Speaker Active Status
**PATCH** `/api/v1/dashboard/academy/speakers/:id/toggle-active`

Toggles the active status of a speaker.

#### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Speaker UUID | "123e4567-e89b-12d3-a456-426614174000" |

#### Response
**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Dr. John Smith",
  "qualification": "PhD in Computer Science, Senior Software Engineer",
  "isActive": false,
  "eventsCount": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

#### Error Responses
- **404 Not Found:** Speaker not found

---

### 6. Delete Speaker
**DELETE** `/api/v1/dashboard/academy/speakers/:id`

Deletes a speaker from the system.

#### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Speaker UUID | "123e4567-e89b-12d3-a456-426614174000" |

#### Response
**Status:** `200 OK`

```json
{
  "message": "Speaker deleted successfully"
}
```

#### Error Responses
- **404 Not Found:** Speaker not found
- **409 Conflict:** Cannot delete speaker that is associated with events

---

### 7. Get Speakers Statistics
**GET** `/api/v1/dashboard/academy/speakers/stats`

Retrieves statistics about speakers.

#### Response
**Status:** `200 OK`

```json
{
  "total": 25,
  "active": 20,
  "inactive": 5,
  "withEvents": 15,
  "withoutEvents": 10
}
```

#### Response Schema
| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of speakers |
| `active` | number | Number of active speakers |
| `inactive` | number | Number of inactive speakers |
| `withEvents` | number | Number of speakers associated with events |
| `withoutEvents` | number | Number of speakers not associated with events |

---

### 8. Get Active Speakers for Selection
**GET** `/api/v1/dashboard/academy/speakers/active`

Retrieves only active speakers for dropdown/selection purposes.

#### Response
**Status:** `200 OK`

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Smith",
    "qualification": "PhD in Computer Science, Senior Software Engineer"
  },
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Dr. Jane Doe",
    "qualification": "PhD in Psychology, Licensed Therapist"
  }
]
```

---

## Data Models

### Speaker Model
```typescript
interface Speaker {
  id: string;                    // UUID
  name: string;                  // Speaker name (max 100 chars)
  qualification: string;         // Speaker qualification (max 500 chars)
  isActive: boolean;             // Active status
  eventsCount?: number;          // Number of associated events (computed)
  events?: Event[];              // Associated events (when included)
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
}
```

### Event Model (Minimal)
```typescript
interface Event {
  id: string;                    // UUID
  title: string;                 // Event title
  type: EventType;               // Event type enum
  isActive: boolean;             // Active status
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "status": false,
  "message": "Error message",
  "data": {
    "code": "ERROR_CODE",
    "details": {
      "message": ["Detailed error messages"],
      "error": "Error type",
      "statusCode": 400
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/dashboard/academy/speakers"
  }
}
```

### Common Error Codes
- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Business logic conflicts (duplicate names, etc.)
- **500 Internal Server Error:** Server errors

---

## Notes

### Validation Rules
- **Name:** Required, string, max 100 characters
- **Qualification:** Optional, string, max 500 characters
- **isActive:** Optional, boolean, defaults to true

### Business Rules
- Speaker names must be unique (case-insensitive)
- Cannot delete speakers that are associated with events
- Toggle active status inverts current status
- Search works on both name and qualification fields

### Relationships
- **EventSpeaker:** Many-to-many relationship with events
- **Events:** Speakers can be associated with multiple events
- **Cascade:** Deleting a speaker removes all event associations

### Pagination
- Uses standard pagination with `page` and `limit` parameters
- Frontend uses `length` parameter (mapped to `limit`)
- Returns pagination metadata with total counts and navigation info

### Sorting
- Supports sorting by multiple fields
- Frontend uses `sort_by` and `sort_dir` parameters
- Default sort is by name in ascending order

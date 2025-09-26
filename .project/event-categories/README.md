# Event Categories API Documentation

## Overview
This module provides CRUD operations for managing event categories in the academy system. Event categories are used to classify and organize different types of events.

## Base URL
```
/academy/event-categories
```

## Authentication
All endpoints require JWT authentication and admin privileges with 'academy' app access.

## API Endpoints

### 1. Create Event Category
**POST** `/academy/event-categories`

Creates a new event category.

#### Request Body
```json
{
  "name": "Technology",
  "isActive": true,
  "position": 1,
  "parentId": "uuid-string"
}
```

#### Request Body Parameters
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 100 | Display name of the category (must be unique) |
| `isActive` | boolean | No | - | Whether the category is active (default: true) |
| `position` | number | No | - | Position for ordering (minimum: 0, default: 0) |
| `parentId` | string | No | - | Parent category ID for hierarchical structure |

#### Response
```json
{
  "id": "uuid-string",
  "name": "Technology",
  "position": 0,
  "isActive": true,
  "parentId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `201` - Event category created successfully
- `409` - Event category with this name already exists
- `400` - Validation error

---

### 2. Get All Event Categories
**GET** `/academy/event-categories`

Retrieves all event categories with filtering and pagination.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (minimum: 1) |
| `length` | number | No | 25 | Items per page (1-100) |
| `search` | string | No | - | Search term to filter results |
| `isActive` | boolean | No | - | Filter by active status |
| `sort_by` | string | No | name | Sort field (name, isActive, createdAt, updatedAt) |
| `sort_dir` | string | No | asc | Sort order (asc, desc) |

#### Example Request
```
GET /academy/event-categories?page=1&length=25&search=tech&isActive=true&sort_by=name&sort_dir=asc
```

#### Response
```json
{
  "data": [
    {
      "id": "uuid-string",
      "name": "Technology",
      "position": 0,
      "isActive": true,
      "parentId": null,
      "eventsCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "length": 25,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Status Codes
- `200` - Event categories retrieved successfully

---

### 3. Get Event Categories Statistics
**GET** `/academy/event-categories/stats`

Retrieves statistics about event categories.

#### Response
```json
{
  "total": 10,
  "active": 8,
  "inactive": 2,
  "withEvents": 5,
  "withoutEvents": 5
}
```

#### Status Codes
- `200` - Statistics retrieved successfully

---

### 4. Get Active Event Categories
**GET** `/academy/event-categories/active`

Retrieves only active event categories for selection purposes.

#### Response
```json
[
  {
    "id": "uuid-string",
    "name": "Technology",
    "parentId": null
  },
  {
    "id": "uuid-string-2",
    "name": "Business",
    "parentId": "uuid-string"
  }
]
```

#### Status Codes
- `200` - Active event categories retrieved successfully

---

### 5. Get Hierarchical Event Categories
**GET** `/academy/event-categories/hierarchical`

Retrieves event categories with their hierarchical structure (parent-child relationships).

#### Response
```json
[
  {
    "id": "uuid-string",
    "name": "Technology",
    "parentId": null,
    "position": 1,
    "eventsCount": 5,
    "childrenCount": 2,
    "children": [
      {
        "id": "uuid-string-2",
        "name": "Web Development",
        "parentId": "uuid-string",
        "position": 1,
        "eventsCount": 3,
        "childrenCount": 0,
        "children": []
      }
    ]
  }
]
```

#### Status Codes
- `200` - Hierarchical event categories retrieved successfully

---

### 6. Get Event Category by ID
**GET** `/academy/event-categories/:id`

Retrieves a specific event category by its ID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event category UUID |

#### Response
```json
{
  "id": "uuid-string",
  "name": "Technology",
  "position": 0,
  "isActive": true,
  "parentId": null,
  "events": [
    {
      "id": "event-uuid-1",
      "title": "Tech Workshop"
    }
  ],
  "eventsCount": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `200` - Event category retrieved successfully
- `404` - Event category not found

---

### 7. Update Event Category
**PATCH** `/academy/event-categories/:id`

Updates an existing event category.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event category UUID |

#### Request Body
```json
{
  "name": "Updated Technology",
  "isActive": false,
  "position": 2,
  "parentId": "uuid-string"
}
```

#### Request Body Parameters
All fields are optional (partial update):
| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `name` | string | 100 | Display name (must be unique) |
| `isActive` | boolean | - | Active status |
| `position` | number | - | Position for ordering |
| `parentId` | string | - | Parent category ID for hierarchical structure |

#### Response
```json
{
  "id": "uuid-string",
  "name": "Updated Technology",
  "position": 0,
  "isActive": false,
  "parentId": null,
  "eventsCount": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `200` - Event category updated successfully
- `404` - Event category not found
- `409` - Event category with this name already exists
- `400` - Validation error

---

### 8. Toggle Event Category Active Status
**PATCH** `/academy/event-categories/:id/toggle-active`

Toggles the active status of an event category.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event category UUID |

#### Response
```json
{
  "id": "uuid-string",
  "name": "Technology",
  "position": 0,
  "isActive": false,
  "parentId": null,
  "eventsCount": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Status Codes
- `200` - Event category status toggled successfully
- `404` - Event category not found

---

### 9. Delete Event Category
**DELETE** `/academy/event-categories/:id`

Deletes an event category.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event category UUID |

#### Response
```json
{
  "message": "Event category deleted successfully"
}
```

#### Status Codes
- `200` - Event category deleted successfully
- `404` - Event category not found
- `409` - Cannot delete event category that is associated with events

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
  "message": "Event category not found",
  "error": "Not Found"
}
```

### Conflict Error (409)
```json
{
  "statusCode": 409,
  "message": "Event category with this name already exists",
  "error": "Conflict"
}
```

## Notes
- All timestamps are in ISO 8601 format
- The `position` field is used for ordering categories (default: 0)
- Categories with associated events cannot be deleted
- The `name` field must be unique across all categories
- Event categories support hierarchical structure via `parentId` field
- The `eventsCount` field shows the number of events associated with each category
- The `childrenCount` field shows the number of child categories
- Circular references are prevented (category cannot be its own parent)
- Parent category must exist when setting `parentId`
- All schema fields are now properly supported in the API

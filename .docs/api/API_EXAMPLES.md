# Settings Actions API - Update Many Endpoint Examples

## Endpoint
`PUT /dashboard/shared/settings-actions/update-many`

## Authentication
Requires: `JwtAuthGuard` + `SuperAdminGuard`

---

## Request Payload Examples

### Example 1: Mixed Setting Types (STRING, NUMBER, BOOLEAN, ARRAY)

```json
{
  "settings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "value": "New Application Name"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "value": 587
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "value": true
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "value": ["item1", "item2", "item3"]
    }
  ]
}
```

### Example 2: UPLOADER Type (Media ID as String)

```json
{
  "settings": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "value": "media-uuid-12345-67890-abcdef"
    }
  ]
}
```

### Example 3: UPLOADER Type (Media ID as Object)

```json
{
  "settings": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "value": {
        "id": "media-uuid-12345-67890-abcdef",
        "mediaId": "media-uuid-12345-67890-abcdef"
      }
    }
  ]
}
```

### Example 4: UPLOADER Type (Remove Media - Set to null)

```json
{
  "settings": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "value": null
    }
  ]
}
```

### Example 5: JSON Type (Complex Object)

```json
{
  "settings": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "value": {
        "street": "Am Kirchberg 3",
        "city": "Meppen Bokeloh",
        "postalCode": "49716",
        "country": "Deutschland"
      }
    }
  ]
}
```

### Example 6: Multiple Settings Update (Real-world Scenario)

```json
{
  "settings": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "value": "Backhaus Support Updated"
    },
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440009",
      "value": "smtp.example.com"
    },
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440010",
      "value": 465
    },
    {
      "id": "110e8400-e29b-41d4-a716-446655440011",
      "value": false
    },
    {
      "id": "220e8400-e29b-41d4-a716-446655440012",
      "value": "new-media-uuid-here"
    }
  ]
}
```

---

## Response Examples

### Case 1: All Settings Updated Successfully

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated 3 settings",
  "data": {
    "success": true,
    "updatedCount": 3,
    "errors": [],
    "updatedSettings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "key": "support.app_name",
        "name": null,
        "description": "Support application name",
        "type": "STRING",
        "value": "New Application Name",
        "apps": ["SUPPORT"],
        "isPublic": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "key": "support.email.smtp_port",
        "name": null,
        "description": "SMTP server port for support emails",
        "type": "NUMBER",
        "value": 587,
        "apps": ["SUPPORT"],
        "isPublic": false,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "key": "support.email.smtp_secure",
        "name": null,
        "description": "Use secure connection for SMTP",
        "type": "BOOLEAN",
        "value": true,
        "apps": ["SUPPORT"],
        "isPublic": false,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      }
    ]
  }
}
```

### Case 2: Partial Success (Some Settings Failed)

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "message": "Updated 2 settings. 2 settings failed to update.",
  "data": {
    "success": false,
    "updatedCount": 2,
    "errors": [
      {
        "settingId": "880e8400-e29b-41d4-a716-446655440003",
        "settingKey": "support.notifications.email",
        "error": "Setting with id 880e8400-e29b-41d4-a716-446655440003 not found"
      },
      {
        "settingId": "990e8400-e29b-41d4-a716-446655440004",
        "settingKey": "support.app_logo",
        "error": "Media with id invalid-media-id not found"
      }
    ],
    "updatedSettings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "key": "support.app_name",
        "name": null,
        "description": "Support application name",
        "type": "STRING",
        "value": "New Application Name",
        "apps": ["SUPPORT"],
        "isPublic": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "key": "support.email.smtp_port",
        "name": null,
        "description": "SMTP server port for support emails",
        "type": "NUMBER",
        "value": 587,
        "apps": ["SUPPORT"],
        "isPublic": false,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      }
    ]
  }
}
```

### Case 3: All Settings Failed

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "message": "Updated 0 settings. 3 settings failed to update.",
  "data": {
    "success": false,
    "updatedCount": 0,
    "errors": [
      {
        "settingId": "550e8400-e29b-41d4-a716-446655440000",
        "settingKey": "support.app_name",
        "error": "Setting with id 550e8400-e29b-41d4-a716-446655440000 not found"
      },
      {
        "settingId": "660e8400-e29b-41d4-a716-446655440001",
        "settingKey": "support.email.smtp_port",
        "error": "Invalid value type for NUMBER setting"
      },
      {
        "settingId": "770e8400-e29b-41d4-a716-446655440002",
        "settingKey": "support.email.smtp_secure",
        "error": "Database connection error"
      }
    ],
    "updatedSettings": []
  }
}
```

### Case 4: UPLOADER Type Success (Media Attached)

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated 1 settings",
  "data": {
    "success": true,
    "updatedCount": 1,
    "errors": [],
    "updatedSettings": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "key": "support.app_logo",
        "name": null,
        "description": "Support application logo (media reference)",
        "type": "UPLOADER",
        "value": {
          "mediaId": "media-uuid-12345-67890-abcdef",
          "collection": "default",
          "alt": "Support Logo",
          "title": "Backhaus Support Logo"
        },
        "apps": ["SUPPORT"],
        "isPublic": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      }
    ]
  }
}
```

### Case 5: UPLOADER Type Success (Media Removed - null value)

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated 1 settings",
  "data": {
    "success": true,
    "updatedCount": 1,
    "errors": [],
    "updatedSettings": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "key": "support.app_logo",
        "name": null,
        "description": "Support application name",
        "type": "UPLOADER",
        "value": null,
        "apps": ["SUPPORT"],
        "isPublic": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T20:00:00.000Z",
        "parent": null
      }
    ]
  }
}
```

---

## Error Response Examples

### Case 1: Validation Error (Empty Array)

**HTTP Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "property": "settings",
      "constraints": {
        "arrayMinSize": "Settings array must not be empty"
      }
    }
  ]
}
```

### Case 2: Validation Error (Invalid UUID)

**HTTP Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "property": "settings[0].id",
      "constraints": {
        "isUuid": "id must be a UUID"
      }
    }
  ]
}
```

### Case 3: Validation Error (Missing Required Field)

**HTTP Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "property": "settings[0].id",
      "constraints": {
        "isNotEmpty": "id should not be empty",
        "isString": "id must be a string"
      }
    },
    {
      "property": "settings[0].value",
      "constraints": {
        "isNotEmpty": "value should not be empty"
      }
    }
  ]
}
```

### Case 4: Unauthorized (Missing/Invalid Token)

**HTTP Status:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Case 5: Forbidden (Not Super Admin)

**HTTP Status:** `403 Forbidden`

```json
{
  "success": false,
  "message": "Forbidden resource"
}
```

---

## Type-Specific Value Handling

### STRING Type
- **Input:** Any string value
- **Storage:** JSON-encoded string
- **Example:** `"value": "New Name"`

### NUMBER Type
- **Input:** Number or string that can be converted to number
- **Storage:** Number
- **Example:** `"value": 587` or `"value": "587"`

### BOOLEAN Type
- **Input:** Boolean or string "true"/"false"
- **Storage:** Boolean
- **Example:** `"value": true` or `"value": "true"`

### ARRAY Type
- **Input:** Array of any type
- **Storage:** Array as-is
- **Example:** `"value": ["item1", "item2"]`

### JSON Type
- **Input:** Any JSON object
- **Storage:** JSON object as-is
- **Example:** `"value": {"key": "value"}`

### UPLOADER Type
- **Input:** 
  - String (media ID): `"value": "media-uuid-123"`
  - Object with id/mediaId: `"value": {"id": "media-uuid-123"}`
  - null (to remove): `"value": null`
- **Storage:** JSON object or null
- **Media Sync:** Automatically syncs media relation using `MediaRelationSyncService`
- **Collection:** Uses setting `key` as collection name

---

## Notes

1. **Partial Updates:** The API processes all settings even if some fail. Check the `errors` array to see which ones failed.

2. **Media Sync:** For UPLOADER type settings, the media relation is automatically synced. If the media ID doesn't exist, it will fail with an appropriate error.

3. **Value Transformation:** Values are automatically normalized based on the setting's type before storage.

4. **Idempotent:** You can safely retry the same request. The API will update settings even if called multiple times.

5. **Transaction Safety:** Each setting update is processed independently. If one fails, others will still be processed.

6. **Error Details:** Each error includes:
   - `settingId`: The UUID of the setting that failed
   - `settingKey`: The key/name of the setting (for easier identification)
   - `error`: The error message explaining what went wrong


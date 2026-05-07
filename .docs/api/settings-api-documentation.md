# Settings Module API Documentation

## Overview

The Settings Module provides endpoints for managing application settings. Settings can be configured with different value types, associated with specific app domains, and marked as public or private.

**Base Path:** `/shared/settings`  
**Version:** `v1`  
**Authentication:** JWT + SuperAdmin required (except public endpoints)



## API Endpoints

### 1. Create Setting

Create a new application setting.

**Endpoint:** `POST /shared/settings`

**Authentication:** Required (JWT + SuperAdmin)

**Request Body:**
```typescript
{
  key: string;                    // Required: Unique setting key
  description?: string | null;     // Optional: Setting description
  type?: SettingValueType;        // Optional: Value type (default: STRING)
  value: unknown;                  // Required: Setting value (JSON)
  apps?: AppDomain[];             // Optional: Associated app domains
  isPublic?: boolean;              // Optional: Public visibility (default: false)
}
```

**Response:** `201 Created`
```typescript
{
  id: string;
  key: string;
  description: string | null;
  type: SettingValueType;
  value: unknown;
  apps: AppDomain[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request:**
```typescript
const { data, error } = await useApiFetch('/shared/settings', {
  method: 'POST',
  body: {
    key: 'app.maintenance_mode',
    description: 'Enable maintenance mode',
    type: 'BOOLEAN',
    value: false,
    apps: ['DASHBOARD'],
    isPublic: false
  }
});
```

---

### 2. Get All Settings

Retrieve all settings, optionally filtered by public visibility.

**Endpoint:** `GET /shared/settings`

**Authentication:** Required (JWT + SuperAdmin)

**Query Parameters:**
- `public` (optional): `'true'` | `'false'` - Filter by public visibility

**Response:** `200 OK`
```typescript
Setting[]
```

**Example Requests:**
```typescript
// Get all settings
const { data } = await useApiFetch('/shared/settings');

// Get only public settings
const { data } = await useApiFetch('/shared/settings?public=true');

// Get only private settings
const { data } = await useApiFetch('/shared/settings?public=false');
```

---

### 3. Get Setting by ID

Retrieve a specific setting by its ID.

**Endpoint:** `GET /shared/settings/:id`

**Authentication:** Required (JWT + SuperAdmin)

**Path Parameters:**
- `id` (string): Setting ID

**Response:** `200 OK`
```typescript
{
  id: string;
  key: string;
  description: string | null;
  type: SettingValueType;
  value: unknown;
  apps: AppDomain[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Error Response:** `404 Not Found`
```typescript
{
  statusCode: 404;
  message: 'Setting not found';
}
```

**Example Request:**
```typescript
const { data, error } = await useApiFetch('/shared/settings/abc123');
```

---

### 4. Update Setting

Update an existing setting. All fields are optional.

**Endpoint:** `PATCH /shared/settings/:id`

**Authentication:** Required (JWT + SuperAdmin)

**Path Parameters:**
- `id` (string): Setting ID

**Request Body:**
```typescript
{
  key?: string;                    // Optional: Update key
  description?: string | null;      // Optional: Update description
  type?: SettingValueType;         // Optional: Update type
  value?: unknown;                  // Optional: Update value
  apps?: AppDomain[];              // Optional: Update apps
  isPublic?: boolean;               // Optional: Update visibility
}
```

**Response:** `200 OK`
```typescript
{
  id: string;
  key: string;
  description: string | null;
  type: SettingValueType;
  value: unknown;
  apps: AppDomain[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Error Response:** `404 Not Found`
```typescript
{
  statusCode: 404;
  message: 'Setting not found';
}
```

**Example Request:**
```typescript
const { data, error } = await useApiFetch('/shared/settings/abc123', {
  method: 'PATCH',
  body: {
    value: true,
    isPublic: false
  }
});
```

---

### 5. Delete Setting

Delete a setting by ID.

**Endpoint:** `DELETE /shared/settings/:id`

**Authentication:** Required (JWT + SuperAdmin)

**Path Parameters:**
- `id` (string): Setting ID

**Response:** `204 No Content`

**Error Response:** `404 Not Found`
```typescript
{
  statusCode: 404;
  message: 'Setting not found';
}
```

**Example Request:**
```typescript
const { error } = await useApiFetch('/shared/settings/abc123', {
  method: 'DELETE'
});
```

---

## Public Endpoints

### 6. Get Outlook Signature Settings

Get outlook signature settings including companies and groups with addresses. This is a public endpoint (no authentication required).

**Endpoint:** `GET /api/v1/public/outlook-signature-settings`

**Authentication:** Not required (Public endpoint)

**Response:** `200 OK`
```typescript
{
  success: true;
  message: 'Outlook signature settings retrieved successfully';
  data: {
    companies: Array<{
      id: string;
      name: string;
      position: number;
      address: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
        // ... other address fields
      };
      fullAddress: string; // Computed full address
      // ... other company fields
    }>;
    groups: Array<{
      id: string;
      name: string;
      isActive: boolean;
      address: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
        // ... other address fields
      };
      fullAddress: string; // Computed full address
      // ... other group fields
    }>;
  };
}
```

**Example Request:**
```typescript
// Direct API call (no proxy needed for public endpoints)
const { data } = await $fetch('http://api.backhaus.local:3055/api/v1/public/outlook-signature-settings');

// Or via proxy if configured
const { data } = await useApiFetch('/api/public/outlook-signature-settings');
```

---

## Type Definitions

### SettingValueType

Enum values for setting value types (from Prisma):
- `STRING` - String value
- `NUMBER` - Numeric value
- `BOOLEAN` - Boolean value
- `JSON` - JSON object/array
- `DATE` - Date value

### AppDomain

Enum values for application domains (from Prisma):
- `DASHBOARD` - Dashboard application
- `ACADEMY` - Academy application
- `SUPPORT` - Support application

### Setting Interface

```typescript
interface Setting {
  id: string;
  key: string;
  description: string | null;
  type: SettingValueType;
  value: unknown; // JSON value
  apps: AppDomain[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Usage Examples

### Nuxt 4 Composable Example

```typescript
// composables/useSettings.ts
export const useSettings = () => {
  const getAllSettings = async (isPublic?: boolean) => {
    const query = isPublic !== undefined ? `?public=${isPublic}` : '';
    return await useApiFetch(`/shared/settings${query}`);
  };

  const getSetting = async (id: string) => {
    return await useApiFetch(`/shared/settings/${id}`);
  };

  const createSetting = async (setting: CreateSettingDto) => {
    return await useApiFetch('/shared/settings', {
      method: 'POST',
      body: setting
    });
  };

  const updateSetting = async (id: string, updates: UpdateSettingDto) => {
    return await useApiFetch(`/shared/settings/${id}`, {
      method: 'PATCH',
      body: updates
    });
  };

  const deleteSetting = async (id: string) => {
    return await useApiFetch(`/shared/settings/${id}`, {
      method: 'DELETE'
    });
  };

  const getOutlookSignatureSettings = async () => {
    return await $fetch('http://api.backhaus.local:3055/api/v1/public/outlook-signature-settings');
  };

  return {
    getAllSettings,
    getSetting,
    createSetting,
    updateSetting,
    deleteSetting,
    getOutlookSignatureSettings
  };
};
```

### Vue Component Example

```vue
<script setup lang="ts">
const { getAllSettings, createSetting, updateSetting, deleteSetting } = useSettings();

const settings = ref([]);
const loading = ref(false);

// Fetch all settings
const loadSettings = async () => {
  loading.value = true;
  try {
    const { data } = await getAllSettings();
    settings.value = data;
  } catch (error) {
    console.error('Failed to load settings:', error);
  } finally {
    loading.value = false;
  }
};

// Create new setting
const handleCreate = async (settingData: CreateSettingDto) => {
  try {
    const { data } = await createSetting(settingData);
    await loadSettings(); // Refresh list
    return data;
  } catch (error) {
    console.error('Failed to create setting:', error);
    throw error;
  }
};

// Update setting
const handleUpdate = async (id: string, updates: UpdateSettingDto) => {
  try {
    const { data } = await updateSetting(id, updates);
    await loadSettings(); // Refresh list
    return data;
  } catch (error) {
    console.error('Failed to update setting:', error);
    throw error;
  }
};

// Delete setting
const handleDelete = async (id: string) => {
  try {
    await deleteSetting(id);
    await loadSettings(); // Refresh list
  } catch (error) {
    console.error('Failed to delete setting:', error);
    throw error;
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <div>
    <h1>Settings Management</h1>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="setting in settings" :key="setting.id">
        <h3>{{ setting.key }}</h3>
        <p>{{ setting.description }}</p>
        <p>Value: {{ setting.value }}</p>
        <button @click="handleDelete(setting.id)">Delete</button>
      </div>
    </div>
  </div>
</template>
```

---

## Error Handling

All endpoints may return standard HTTP error responses:

- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User is not a SuperAdmin
- **404 Not Found** - Setting not found
- **500 Internal Server Error** - Server error

**Error Response Format:**
```typescript
{
  statusCode: number;
  message: string;
  error?: string;
}
```

---

## Notes

1. **Authentication:** All settings endpoints (except public outlook signature) require JWT authentication and SuperAdmin privileges.

2. **Value Types:** The `value` field accepts any JSON-serializable data. The `type` field helps categorize the setting but doesn't enforce strict validation.

3. **Public Settings:** Settings marked as `isPublic: true` can be accessed by non-authenticated users through appropriate public endpoints.

4. **App Domains:** Settings can be associated with specific app domains (`DASHBOARD`, `ACADEMY`, `SUPPORT`) to scope them to particular applications.

5. **Ordering:** The `findAll` endpoint returns settings ordered by `key` in ascending order.

---

## Related Files

- **Controller:** `settings.controller.ts`
- **Service:** `settings.service.ts`
- **Module:** `settings.module.ts`
- **DTOs:** 
  - `dto/create-setting.dto.ts`
  - `dto/update-setting.dto.ts`
- **Public Controller:** `controllers/outlook-signature-public.controller.ts`


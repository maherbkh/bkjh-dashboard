# Events API Changes - Many-to-Many Relationships

## Summary
Events now support **multiple categories** and **multiple targets** instead of single values.

---

## Breaking Changes

### Request Changes

#### ❌ OLD (Create/Update Event)
```typescript
{
  eventCategoryId: string;  // Single category
  eventTargetId: string;    // Single target
}
```

#### ✅ NEW (Create/Update Event)
```typescript
{
  eventCategoryIds: string[];  // Array of category IDs (required, min 1, max 10)
  eventTargetIds: string[];   // Array of target IDs (required, min 1, max 10)
}
```

### Response Changes

#### ❌ OLD
```typescript
{
  category: {
    id: string;
    name: string;
  };
  target: {
    id: string;
    name: string;
    code: string;
  };
}
```

#### ✅ NEW
```typescript
{
  categories: [
    {
      id: string;  // Junction table ID
      eventCategory: {
        id: string;
        name: string;
      };
    }
  ];
  targets: [
    {
      id: string;  // Junction table ID
      eventTarget: {
        id: string;
        name: string;
        code: string;
      };
    }
  ];
}
```

---

## Query Parameters Changes

#### ❌ OLD
```
?eventCategoryId=550e8400-e29b-41d4-a716-446655440001
&eventTargetId=660e8400-e29b-41d4-a716-446655440001
```

#### ✅ NEW
```
// Array format (recommended)
?eventCategoryIds[]=550e8400-e29b-41d4-a716-446655440001
&eventCategoryIds[]=550e8400-e29b-41d4-a716-446655440002
&eventTargetIds[]=660e8400-e29b-41d4-a716-446655440001

// OR comma-separated string (also supported)
?eventCategoryIds=550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002
&eventTargetIds=660e8400-e29b-41d4-a716-446655440001
```

---

## Frontend Update Guide

### 1. Update TypeScript Types

```typescript
// OLD
interface CreateEventRequest {
  eventCategoryId: string;
  eventTargetId: string;
}

interface EventResponse {
  category?: { id: string; name: string };
  target?: { id: string; name: string; code: string };
}

// NEW
interface CreateEventRequest {
  eventCategoryIds: string[];  // Required, min 1, max 10
  eventTargetIds: string[];    // Required, min 1, max 10
}

interface EventResponse {
  categories: Array<{
    id: string;
    eventCategory: { id: string; name: string };
  }>;
  targets: Array<{
    id: string;
    eventTarget: { id: string; name: string; code: string };
  }>;
}
```

### 2. Update Form Components

```typescript
// OLD - Single select
<Select
  value={formData.eventCategoryId}
  onChange={(value) => setFormData({ ...formData, eventCategoryId: value })}
/>

// NEW - Multi select
<MultiSelect
  value={formData.eventCategoryIds || []}
  onChange={(values) => setFormData({ ...formData, eventCategoryIds: values })}
  min={1}
  max={10}
/>
```

### 3. Update Display Components

```typescript
// OLD
{event.category && (
  <span>{event.category.name}</span>
)}

// NEW
{event.categories.map(cat => (
  <span key={cat.id}>{cat.eventCategory.name}</span>
))}
```

### 4. Update Filter Components

```typescript
// OLD
const [selectedCategory, setSelectedCategory] = useState<string>('');
const filters = { eventCategoryId: selectedCategory };

// NEW
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const filters = { eventCategoryIds: selectedCategories };
```

### 5. Update API Calls

```typescript
// OLD
const createEvent = async (data: CreateEventRequest) => {
  const payload = {
    ...data,
    eventCategoryId: data.eventCategoryId,
    eventTargetId: data.eventTargetId
  };
  // ...
};

// NEW
const createEvent = async (data: CreateEventRequest) => {
  const payload = {
    ...data,
    eventCategoryIds: data.eventCategoryIds,  // Already an array
    eventTargetIds: data.eventTargetIds         // Already an array
  };
  // ...
};
```

### 6. Update Query Parameters

```typescript
// OLD
const params = new URLSearchParams();
if (filters.eventCategoryId) {
  params.append('eventCategoryId', filters.eventCategoryId);
}

// NEW
const params = new URLSearchParams();
if (filters.eventCategoryIds?.length) {
  filters.eventCategoryIds.forEach(id => {
    params.append('eventCategoryIds[]', id);
  });
}
```

### 7. Helper Functions

```typescript
// Extract IDs from response for editing
const getCategoryIds = (event: EventResponse): string[] => {
  return event.categories.map(cat => cat.eventCategory.id);
};

const getTargetIds = (event: EventResponse): string[] => {
  return event.targets.map(target => target.eventTarget.id);
};

// Get names for display
const getCategoryNames = (event: EventResponse): string[] => {
  return event.categories.map(cat => cat.eventCategory.name);
};

const getTargetNames = (event: EventResponse): string[] => {
  return event.targets.map(target => target.eventTarget.name);
};
```

---

## Validation Rules

- **eventCategoryIds**: Required, array, minimum 1 item, maximum 10 items, each must be valid UUID
- **eventTargetIds**: Required, array, minimum 1 item, maximum 10 items, each must be valid UUID

---

## Important Notes

1. **Update replaces all relationships**: When updating an event, providing `eventCategoryIds` or `eventTargetIds` will **replace all existing** relationships. Include existing IDs if you want to keep them.

2. **Query filtering**: Filtering by multiple categories/targets returns events that match **any** of the provided IDs.

3. **Junction table IDs**: The `id` field in `categories` and `targets` arrays is the junction table ID. You typically only need `eventCategory.id` and `eventTarget.id`.

---

## Affected Endpoints

### Dashboard Endpoints (Admin)
All dashboard endpoints now use arrays:

- ✅ `POST /dashboard/academy/events` - Create
- ✅ `PATCH /dashboard/academy/events/:id` - Update
- ✅ `GET /dashboard/academy/events` - List (with filtering)
- ✅ `GET /dashboard/academy/events/:id` - Get by ID
- ✅ `GET /dashboard/academy/events/slug/:slug` - Get by slug
- ✅ `GET /dashboard/academy/events/upcoming` - Upcoming events
- ✅ `GET /dashboard/academy/events/by-category/:categoryId` - By category
- ✅ `PATCH /dashboard/academy/events/:id/toggle-active` - Toggle status
- ✅ `PATCH /dashboard/academy/events/:id/status` - Update status

### Public Academy Endpoints
Public endpoints also changed:

- ✅ `GET /academy/events` - List events (query: `categoryIds[]`, `targetIds[]`)
- ✅ `GET /academy/events/upcoming` - Upcoming events
- ✅ `GET /academy/events/event/:slug` - Get event by slug

**Note:** Public endpoints use `categoryIds` and `targetIds` (not `eventCategoryIds`/`eventTargetIds`)

---

## Public Academy Endpoints Details

### Query Parameters (Public Endpoints)

#### ❌ OLD
```
?categoryId=550e8400-e29b-41d4-a716-446655440001
&targetId=660e8400-e29b-41d4-a716-446655440001
```

#### ✅ NEW
```
// Array format (recommended)
?categoryIds[]=550e8400-e29b-41d4-a716-446655440001
&categoryIds[]=550e8400-e29b-41d4-a716-446655440002
&targetIds[]=660e8400-e29b-41d4-a716-446655440001

// OR comma-separated string (also supported)
?categoryIds=550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002
&targetIds=660e8400-e29b-41d4-a716-446655440001
```

### Public Endpoint Response Structure

```typescript
// Public endpoints return simplified structure
interface EventInterface {
  id: string;
  title: string;
  slug: string;
  // ... other fields
  
  // ✅ CHANGED: Arrays (simplified structure, no junction table IDs)
  categories: Array<{
    id: string;
    name: string;
  }>;
  targets: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  
  // ... rest of fields
}
```

**Note:** Public endpoints return a simplified structure where `categories` and `targets` are direct arrays without the junction table wrapper.

---

**Last Updated:** November 7, 2024


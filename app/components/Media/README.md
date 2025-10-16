# Media Components

A comprehensive media management system with upload, selection, and form integration capabilities.

## Components

### 1. MediaUploader (`Media/Uploader/index.vue`)
Handles file uploads with drag & drop support, validation, and progress tracking.

**Props:**
- `modelValue`: `MediaFile | MediaFile[] | null` - Selected file(s)
- `multiple`: `boolean` - Allow multiple file selection
- `maxFiles`: `number` - Maximum number of files (default: 1)
- `maxSize`: `number` - Maximum file size in MB (default: 5)
- `allowedTypes`: `string[]` - Allowed file types (e.g., ['image', 'document'])
- `accessLevel`: `'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC'` - Access level
- `collectionName`: `string` - Collection name for organization
- `modelType`: `string` - Associated model type
- `modelId`: `string` - Associated model ID
- `directory`: `string` - Storage directory

**Usage:**
```vue
<MediaUploader
    v-model="selectedFile"
    label="Upload Image"
    :multiple="false"
    :allowed-types="['image']"
    :max-size="5"
    access-level="PUBLIC"
    collection-name="gallery"
/>
```

### 2. MediaManager (`Media/Manager/index.vue`)
Gallery dialog for selecting existing media files.

**Props:**
- `open`: `boolean` - Dialog open state
- `multiple`: `boolean` - Allow multiple selection
- `maxSelection`: `number` - Maximum selection count
- `allowedTypes`: `string[]` - Filter by file types
- `accessLevel`: `string` - Filter by access level
- `collectionName`: `string` - Filter by collection
- `modelType`: `string` - Filter by model type
- `modelId`: `string` - Filter by model ID
- `selectedFiles`: `MediaFile[]` - Currently selected files

**Events:**
- `update:open` - Dialog open state change
- `update:selectedFiles` - Selected files change
- `select` - File(s) selected
- `close` - Dialog closed

**Usage:**
```vue
<MediaManager
    v-model:open="showGallery"
    :multiple="true"
    :allowed-types="['image']"
    access-level="PUBLIC"
    @select="handleMediaSelect"
/>
```

### 3. FormItemMedia (`FormItem/Media.vue`)
Form field component that combines uploader and manager functionality.

**Props:**
- `modelValue`: `MediaFile | MediaFile[] | null` - Selected file(s)
- `multiple`: `boolean` - Allow multiple selection
- `maxFiles`: `number` - Maximum files
- `maxSize`: `number` - Maximum file size
- `allowedTypes`: `string[]` - Allowed file types
- `accessLevel`: `string` - Access level
- `collectionName`: `string` - Collection name
- `modelType`: `string` - Model type
- `modelId`: `string` - Model ID
- `directory`: `string` - Storage directory
- `showManager`: `boolean` - Show manager button
- `errors`: `string[]` - Validation errors
- `disabled`: `boolean` - Disable component

**Usage:**
```vue
<FormItemMedia
    v-model="formData.media"
    label="Select Media"
    :multiple="true"
    :allowed-types="['image']"
    :max-files="5"
    access-level="PUBLIC"
    collection-name="gallery"
    show-manager
/>
```

## Usage Examples

### Single File Selection
```vue
<script setup>
const selectedFile = ref(null);

const handleFileSelect = (file) => {
    selectedFile.value = file;
};
</script>

<template>
    <FormItemMedia
        v-model="selectedFile"
        label="Choose Image"
        :multiple="false"
        :allowed-types="['image']"
        show-manager
    />
</template>
```

### Multiple Files with Upload
```vue
<script setup>
const selectedFiles = ref([]);

const handleFilesSelect = (files) => {
    selectedFiles.value = files;
};
</script>

<template>
    <MediaUploader
        v-model="selectedFiles"
        label="Upload Multiple Files"
        :multiple="true"
        :max-files="5"
        :allowed-types="['image', 'document']"
        access-level="PUBLIC"
        collection-name="gallery"
    />
</template>
```

### Gallery Selection
```vue
<script setup>
const showGallery = ref(false);
const selectedMedia = ref([]);

const handleMediaSelect = (media) => {
    selectedMedia.value = Array.isArray(media) ? media : [media];
    showGallery.value = false;
};
</script>

<template>
    <Button @click="showGallery = true">
        Choose from Gallery
    </Button>
    
    <MediaManager
        v-model:open="showGallery"
        :multiple="true"
        :allowed-types="['image']"
        access-level="PUBLIC"
        @select="handleMediaSelect"
    />
</template>
```

## API Integration

The components automatically handle:
- **Authentication**: Uses `useApiFetch` with proper headers
- **File Upload**: Multipart form data with validation
- **Image Loading**: Authenticated URLs through proxy
- **Error Handling**: Validation and network errors
- **Progress Tracking**: Upload progress indicators

## Validation Rules

Files are validated based on:
- **File Size**: Configurable maximum size
- **File Types**: MIME type validation
- **Security**: Blocks executable and script files
- **Access Control**: User permission validation

## Styling

Components use:
- **Tailwind CSS**: Utility classes
- **Shadcn UI**: Component library
- **Theme Variables**: Light/dark mode support
- **Solar Icons**: Consistent iconography
- **Responsive Design**: Mobile-friendly layouts
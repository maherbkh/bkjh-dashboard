# 🎯 **Complete Dashboard Media API Guide for Nuxt Frontend**

## 📋 **Base Configuration**

Your `useApiFetch` is configured with:
- **Base URL**: `http://api.backhaus.test:3055/api/v1/dashboard`
- **Authentication**: Automatic Bearer token from `useUserStore`
- **Prefix**: `/backend` (from useApiFetch implementation)

## 🔐 **API Endpoints Overview**

All endpoints use your `useApiFetch` with automatic authentication:

```typescript
// Your useApiFetch automatically handles:
// - Base URL: /backend + path
// - Authentication: Bearer token from userStore
// - Error handling: Global error handler
// - Content-Type: application/json (except FormData)
```

---

## 📤 **1. Upload Single Media**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch('/shared/media/upload', {
    method: 'POST',
    body: formData
});
```

### **Request Implementation**
```typescript
const uploadSingleFile = async (file: File, options: {
    accessLevel?: 'PUBLIC' | 'SELF' | 'SUPPORT' | 'ACADEMY';
    collectionName?: string;
    modelType?: string;
    modelId?: string;
    directory?: string;
    title?: string;
    description?: string;
    altText?: string;
}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'DASHBOARD');
    formData.append('accessLevel', options.accessLevel || 'PUBLIC');
    formData.append('collectionName', options.collectionName || 'default');
    formData.append('directory', options.directory || 'shared');
    
    if (options.modelType) formData.append('modelType', options.modelType);
    if (options.modelId) formData.append('modelId', options.modelId);
    if (options.title) formData.append('title', options.title);
    if (options.description) formData.append('description', options.description);
    if (options.altText) formData.append('altText', options.altText);

    const { data, error } = await useApiFetch('/shared/media/upload', {
        method: 'POST',
        body: formData
    });

    return { data: data.value, error: error.value };
};
```

### **Response Structure**
```typescript
interface UploadResponse {
    success: boolean;
    media: MediaFile;
    urls: {
        public?: string;
        internal: string;
    };
}
```

---

## 📤 **2. Upload Multiple Media**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch('/shared/media/upload-many', {
    method: 'POST',
    body: formData
});
```

### **Request Implementation**
```typescript
const uploadMultipleFiles = async (files: File[], options: {
    accessLevel?: 'PUBLIC' | 'SELF' | 'SUPPORT' | 'ACADEMY';
    collectionName?: string;
    modelType?: string;
    modelId?: string;
    directory?: string;
    maxFiles?: number;
}) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('accessLevel', options.accessLevel || 'PUBLIC');
    formData.append('collectionName', options.collectionName || 'default');
    formData.append('directory', options.directory || 'shared');
    formData.append('maxFiles', (options.maxFiles || 50).toString());
    
    if (options.modelType) formData.append('modelType', options.modelType);
    if (options.modelId) formData.append('modelId', options.modelId);

    const { data, error } = await useApiFetch('/shared/media/upload-many', {
        method: 'POST',
        body: formData
    });

    return { data: data.value, error: error.value };
};
```

---

## 📋 **3. Get All Media (Paginated)**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch('/shared/media', {
    query: {
        page: 1,
        length: 25,
        search: 'profile',
        sort_by: 'createdAt',
        sort_dir: 'desc',
        accessLevel: 'PUBLIC',
        collectionName: 'gallery'
    }
});
```

### **Query Parameters**
```typescript
interface MediaQueryParams {
    page?: number;           // Default: 1
    length?: number;          // Default: 25, Max: 100
    search?: string;        // Search in filename, mimeType, title, description
    sort_by?: 'createdAt' | 'updatedAt' | 'filename' | 'size' | 'mimeType';
    sort_dir?: 'asc' | 'desc';
    accessLevel?: 'PUBLIC' | 'SELF' | 'SUPPORT' | 'ACADEMY';
    collectionName?: string;
    modelType?: string;
    modelId?: string;
    mimeType?: string;
}
```

### **Response Structure**
```typescript
interface MediaListResponse {
    data: MediaFile[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextPage: number | null;
        prevPage: number | null;
    };
}
```

---

## 🔍 **4. Get Single Media**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch(`/shared/media/${mediaId}`);
```

---

## ✏️ **5. Update Media**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch(`/shared/media/${mediaId}`, {
    method: 'PATCH',
    body: {
        title: 'Updated Title',
        description: 'Updated description',
        altText: 'Updated alt text',
        accessLevel: 'PUBLIC'
    }
});
```

---

## 🗑️ **6. Delete Media**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch(`/shared/media/${mediaId}`, {
    method: 'DELETE'
});
```

---

## 🔗 **7. Attach Media to Model**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch(`/shared/media/${mediaId}/attach`, {
    method: 'POST',
    body: {
        modelType: 'Admin',
        modelId: 'admin-uuid',
        collectionName: 'avatar',
        sortOrder: 0
    }
});
```

---

## 🔓 **8. Detach Media from Model**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch(`/shared/media/${mediaId}/detach`, {
    method: 'DELETE',
    query: {
        modelType: 'Admin',
        modelId: 'admin-uuid',
        collectionName: 'avatar'
    }
});
```

---

## 📁 **9. Get Model Media Collection**

### **Endpoint**
```typescript
// Get specific collection
const { data, error } = await useApiFetch(`/shared/media/model/${modelType}/${modelId}/${collectionName}`);

// Get default collection
const { data, error } = await useApiFetch(`/shared/media/model/${modelType}/${modelId}`);
```

---

## 📊 **10. Get Media Statistics**

### **Endpoint**
```typescript
const { data, error } = await useApiFetch('/shared/media/stats');
```

---

## 🌐 **11. Public Media Access**

### **Show Media (Inline)**
```typescript
// Direct URL for PUBLIC media
const publicUrl = `http://api.backhaus.test:3055/uploads/public/${storedName}`;

// Authenticated URL for non-PUBLIC media
const authUrl = `http://api.backhaus.test:3055/api/v1/media/${uuid}/show`;
```

### **Download Media**
```typescript
const downloadUrl = `http://api.backhaus.test:3055/api/v1/media/${uuid}/download`;
```

---

## 🎯 **Nuxt Implementation Examples**

### **1. Enhanced Media Uploader Component**

```vue
<template>
  <div class="media-uploader">
    <div 
      class="upload-area"
      :class="{ 'dragging': dragging, 'uploading': uploading }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput"
        type="file" 
        :multiple="multiple"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="uploading" class="upload-progress">
        <Icon name="solar:refresh-outline" class="animate-spin" />
        <p>Uploading...</p>
      </div>
      
      <div v-else-if="files.length > 0" class="file-preview">
        <div v-for="(file, index) in files" :key="file.id" class="file-item">
          <img v-if="isImage(file)" :src="getFileUrl(file)" :alt="file.filename" />
          <div v-else class="file-icon">
            <Icon :name="getFileIcon(file.mimeType)" />
          </div>
          <button @click="removeFile(index)" class="remove-btn">
            <Icon name="solar:trash-bin-outline" />
          </button>
        </div>
      </div>
      
      <div v-else class="upload-prompt">
        <Icon name="solar:gallery-send-outline" />
        <p>Drop files here or click to upload</p>
        <p class="text-sm text-muted-foreground">
          Max size: {{ maxSize }}MB, Types: {{ allowedTypesText }}
        </p>
      </div>
    </div>
    
    <div v-if="errors.length > 0" class="error-messages">
      <p v-for="error in errors" :key="error" class="text-red-600">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: MediaFile | MediaFile[] | null;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  accessLevel?: 'PUBLIC' | 'SELF' | 'SUPPORT' | 'ACADEMY';
  collectionName?: string;
  modelType?: string;
  modelId?: string;
  directory?: string;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  maxFiles: 1,
  maxSize: 10,
  allowedTypes: () => ['image'],
  accessLevel: 'PUBLIC',
  collectionName: 'default',
  directory: 'shared'
});

const emit = defineEmits<{
  'update:modelValue': [value: MediaFile | MediaFile[] | null];
  'upload:success': [file: MediaFile];
  'upload:error': [error: string];
}>();

const files = ref<MediaFile[]>([]);
const uploading = ref(false);
const dragging = ref(false);
const errors = ref<string[]>([]);
const fileInput = ref<HTMLInputElement>();

// Initialize files from modelValue
watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue)) {
    files.value = newValue;
  } else if (newValue) {
    files.value = [newValue];
  } else {
    files.value = [];
  }
}, { immediate: true });

// Watch files changes and emit
watch(files, (newFiles) => {
  if (props.multiple) {
    emit('update:modelValue', [...newFiles]);
  } else {
    emit('update:modelValue', newFiles.length > 0 ? newFiles[0] : null);
  }
}, { deep: true });

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  const fileList = Array.from(target.files);
  await uploadFiles(fileList);
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  dragging.value = false;
  
  if (!event.dataTransfer?.files.length) return;
  
  const fileList = Array.from(event.dataTransfer.files);
  await uploadFiles(fileList);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragging.value = true;
};

const handleDragLeave = () => {
  dragging.value = false;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const uploadFiles = async (fileList: File[]) => {
  if (fileList.length === 0) return;
  
  uploading.value = true;
  errors.value = [];
  
  try {
    if (props.multiple) {
      await uploadMultipleFiles(fileList);
    } else {
      await uploadSingleFile(fileList[0]);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    errors.value = [errorMessage];
    emit('upload:error', errorMessage);
  } finally {
    uploading.value = false;
  }
};

const uploadSingleFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', 'DASHBOARD');
  formData.append('accessLevel', props.accessLevel);
  formData.append('collectionName', props.collectionName);
  formData.append('directory', props.directory);
  
  if (props.modelType) formData.append('modelType', props.modelType);
  if (props.modelId) formData.append('modelId', props.modelId);

  const { data, error } = await useApiFetch('/shared/media/upload', {
    method: 'POST',
    body: formData
  });

  if (error.value) {
    throw new Error(error.value.message || 'Upload failed');
  }

  if (data.value?.media) {
    files.value = [data.value.media];
    emit('upload:success', data.value.media);
  }
};

const uploadMultipleFiles = async (fileList: File[]) => {
  const formData = new FormData();
  fileList.forEach(file => formData.append('files', file));
  formData.append('accessLevel', props.accessLevel);
  formData.append('collectionName', props.collectionName);
  formData.append('directory', props.directory);
  formData.append('maxFiles', props.maxFiles.toString());
  
  if (props.modelType) formData.append('modelType', props.modelType);
  if (props.modelId) formData.append('modelId', props.modelId);

  const { data, error } = await useApiFetch('/shared/media/upload-many', {
    method: 'POST',
    body: formData
  });

  if (error.value) {
    throw new Error(error.value.message || 'Upload failed');
  }

  if (data.value?.successful) {
    files.value = [...files.value, ...data.value.successful];
    data.value.successful.forEach((file: MediaFile) => emit('upload:success', file));
  }
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

const isImage = (file: MediaFile) => {
  return file.mimeType?.startsWith('image/');
};

const getFileUrl = (file: MediaFile) => {
  if (file.accessLevel === 'PUBLIC') {
    return `http://api.backhaus.test:3055/uploads/public/${file.storedName}`;
  }
  return `http://api.backhaus.test:3055/api/v1/media/${file.uuid}/show`;
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'solar:gallery-outline';
  if (mimeType.startsWith('video/')) return 'solar:video-camera-outline';
  if (mimeType.startsWith('audio/')) return 'solar:music-note-outline';
  if (mimeType.includes('pdf')) return 'solar:document-outline';
  return 'solar:file-outline';
};

const allowedTypesText = computed(() => {
  return props.allowedTypes.map(type => type.toUpperCase()).join(', ');
});
</script>
```

### **2. Enhanced Media Manager Component**

```vue
<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-6xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Media Gallery</DialogTitle>
        <DialogDescription>Select media files</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Search and Filters -->
        <div class="flex gap-2">
          <Input 
            v-model="searchQuery" 
            placeholder="Search media..."
            @input="debouncedSearch"
          />
          <Select v-model="accessLevelFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="SELF">Private</SelectItem>
              <SelectItem value="SUPPORT">Support</SelectItem>
              <SelectItem value="ACADEMY">Academy</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="sortBy">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="filename">Filename</SelectItem>
              <SelectItem value="size">File Size</SelectItem>
              <SelectItem value="mimeType">File Type</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Media Grid -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading" class="grid grid-cols-4 gap-4">
            <div v-for="i in 12" :key="i" class="aspect-square bg-muted animate-pulse rounded" />
          </div>
          
          <div v-else-if="mediaFiles.length > 0" class="grid grid-cols-4 gap-4">
            <div
              v-for="file in mediaFiles"
              :key="file.id"
              :class="[
                'relative group cursor-pointer rounded-lg border-2 transition-all',
                isSelected(file.id) ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
              ]"
              @click="selectFile(file)"
            >
              <div class="aspect-square overflow-hidden rounded-lg">
                <img 
                  v-if="isImage(file.mimeType)"
                  :src="getFileUrl(file)"
                  :alt="file.filename"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-muted">
                  <Icon :name="getFileIcon(file.mimeType)" class="w-8 h-8" />
                </div>
              </div>
              
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2 text-xs">
                <div class="truncate">{{ file.filename }}</div>
                <div>{{ formatFileSize(file.size) }}</div>
              </div>
              
              <div v-if="isSelected(file.id)" class="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="solar:check-circle-bold" class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <Icon name="solar:gallery-minimalistic-outline" class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p class="text-muted-foreground">No media files found</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination" class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }}
          </div>
          <div class="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              :disabled="pagination.current_page === 1"
              @click="prevPage"
            >
              Previous
            </Button>
            <span class="text-sm">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
            <Button 
              variant="outline" 
              size="sm"
              :disabled="pagination.current_page === pagination.last_page"
              @click="nextPage"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div class="flex items-center justify-between w-full">
          <div class="text-sm text-muted-foreground">
            {{ selectedFiles.length }} selected
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="handleClose">
              Cancel
            </Button>
            <Button @click="handleSelect" :disabled="selectedFiles.length === 0">
              Select ({{ selectedFiles.length }})
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
interface Props {
  open?: boolean;
  multiple?: boolean;
  maxSelection?: number;
  allowedTypes?: string[];
  accessLevel?: 'PUBLIC' | 'SELF' | 'SUPPORT' | 'ACADEMY';
  collectionName?: string;
  modelType?: string;
  modelId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  multiple: false,
  maxSelection: 1,
  allowedTypes: () => ['image'],
  accessLevel: 'PUBLIC',
  collectionName: '',
  modelType: '',
  modelId: ''
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'select': [files: MediaFile | MediaFile[]];
  'close': [];
}>();

const mediaFiles = ref<MediaFile[]>([]);
const loading = ref(false);
const pagination = ref<MediaPagination | null>(null);
const searchQuery = ref('');
const accessLevelFilter = ref('');
const sortBy = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');
const selectedFiles = ref<MediaFile[]>([]);

const loadMedia = async (params: Partial<MediaQueryParams> = {}) => {
  loading.value = true;
  
  try {
    const queryParams: MediaQueryParams = {
      page: pagination.value?.current_page || 1,
      length: 24,
      search: searchQuery.value,
      accessLevel: accessLevelFilter.value as any,
      collectionName: props.collectionName,
      modelType: props.modelType,
      modelId: props.modelId,
      sort_by: sortBy.value as any,
      sort_dir: sortDir.value
    };

    // Remove empty values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    const { data, error } = await useApiFetch('/shared/media', {
      query: cleanParams
    });

    if (error.value) {
      throw new Error(error.value.message || 'Failed to load media');
    }

    if (data.value?.data) {
      mediaFiles.value = data.value.data;
      pagination.value = data.value.meta;
    }
  } catch (error) {
    console.error('Failed to load media:', error);
    mediaFiles.value = [];
    pagination.value = null;
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(() => {
  pagination.value = { ...pagination.value!, current_page: 1 };
  loadMedia();
}, 300);

const nextPage = () => {
  if (pagination.value && pagination.value.current_page < pagination.value.last_page) {
    pagination.value.current_page++;
    loadMedia();
  }
};

const prevPage = () => {
  if (pagination.value && pagination.value.current_page > 1) {
    pagination.value.current_page--;
    loadMedia();
  }
};

const selectFile = (file: MediaFile) => {
  if (!props.multiple) {
    selectedFiles.value = [file];
  } else {
    const index = selectedFiles.value.findIndex(f => f.id === file.id);
    if (index === -1) {
      if (selectedFiles.value.length < props.maxSelection) {
        selectedFiles.value.push(file);
      }
    } else {
      selectedFiles.value.splice(index, 1);
    }
  }
};

const isSelected = (fileId: string) => {
  return selectedFiles.value.some(file => file.id === fileId);
};

const handleSelect = () => {
  if (selectedFiles.value.length > 0) {
    if (props.multiple) {
      emit('select', selectedFiles.value);
    } else {
      emit('select', selectedFiles.value[0]);
    }
    handleClose();
  }
};

const handleClose = () => {
  emit('update:open', false);
  emit('close');
};

const isImage = (mimeType: string) => {
  return mimeType.startsWith('image/');
};

const getFileUrl = (file: MediaFile) => {
  if (file.accessLevel === 'PUBLIC') {
    return `http://api.backhaus.test:3055/uploads/public/${file.storedName}`;
  }
  return `http://api.backhaus.test:3055/api/v1/media/${file.uuid}/show`;
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'solar:gallery-outline';
  if (mimeType.startsWith('video/')) return 'solar:video-camera-outline';
  if (mimeType.startsWith('audio/')) return 'solar:music-note-outline';
  if (mimeType.includes('pdf')) return 'solar:document-outline';
  return 'solar:file-outline';
};

const formatFileSize = (size: number) => {
  if (size === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Watch for dialog open
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    loadMedia();
  }
});
</script>
```

### **3. Usage Examples**

```vue
<template>
  <div class="space-y-6">
    <!-- Single File Upload -->
    <MediaUploader
      v-model="singleFile"
      label="Upload Profile Picture"
      :multiple="false"
      :allowed-types="['image']"
      :max-size="5"
      access-level="PUBLIC"
      collection-name="avatar"
    />

    <!-- Multiple Files Upload -->
    <MediaUploader
      v-model="multipleFiles"
      label="Upload Gallery Images"
      :multiple="true"
      :max-files="10"
      :allowed-types="['image']"
      :max-size="10"
      access-level="PUBLIC"
      collection-name="gallery"
    />

    <!-- Media Manager -->
    <Button @click="showManager = true">
      Choose from Gallery
    </Button>
    
    <MediaManager
      v-model:open="showManager"
      :multiple="true"
      :allowed-types="['image']"
      access-level="PUBLIC"
      @select="handleMediaSelect"
    />
  </div>
</template>

<script setup lang="ts">
const singleFile = ref<MediaFile | null>(null);
const multipleFiles = ref<MediaFile[]>([]);
const showManager = ref(false);

const handleMediaSelect = (files: MediaFile | MediaFile[]) => {
  if (Array.isArray(files)) {
    multipleFiles.value = files;
  } else {
    singleFile.value = files;
  }
  showManager.value = false;
};
</script>
```

This guide provides everything you need to implement a complete media management system in your Nuxt frontend using your existing `useApiFetch` setup! 🚀

<template>
    <div class="p-6 space-y-6">
        <h2 class="text-2xl font-bold">Media Components Test</h2>
        
        <!-- Single File Uploader -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Single File Uploader</h3>
            <MediaUploader
                v-model="singleFile"
                label="Upload Single File"
                name="single-file"
                :allowed-types="['image']"
                :max-size="5"
                :max-files="1"
                access-level="PUBLIC"
                collection-name="default"
            />
            <div v-if="singleFile" class="p-4 bg-gray-100 rounded">
                <p><strong>Selected File:</strong> {{ singleFile.filename }}</p>
                <p><strong>Size:</strong> {{ formatBytes(singleFile.size) }}</p>
            </div>
        </div>

        <!-- Multiple Files Uploader -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Multiple Files Uploader</h3>
            <MediaUploader
                v-model="multipleFiles"
                label="Upload Multiple Files"
                name="multiple-files"
                :multiple="true"
                :allowed-types="['image', 'document']"
                :max-size="10"
                :max-files="5"
                access-level="PUBLIC"
                collection-name="gallery"
            />
            <div v-if="multipleFiles && multipleFiles.length > 0" class="p-4 bg-gray-100 rounded">
                <p><strong>Selected Files:</strong> {{ multipleFiles.length }}</p>
                <ul class="list-disc list-inside">
                    <li v-for="file in multipleFiles" :key="file.id">
                        {{ file.filename }} ({{ formatBytes(file.size) }})
                    </li>
                </ul>
            </div>
        </div>

        <!-- Media Manager -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Media Manager</h3>
            <Button @click="showManager = true">
                Open Media Gallery
            </Button>
            <MediaManager
                v-model:open="showManager"
                :multiple="true"
                :allowed-types="['image']"
                access-level="PUBLIC"
                collection-name=""
                @select:media="handleMediaSelect"
            />
        </div>

        <!-- Form Item Media -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Form Item Media</h3>
            <FormItemMedia
                v-model="formMedia"
                label="Form Media Field"
                name="form-media"
                :multiple="true"
                :allowed-types="['image', 'document']"
                :max-size="5"
                :max-files="3"
                access-level="PUBLIC"
                collection-name="attachments"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MediaFile } from '~/types/media';
import MediaUploader from '~/components/Media/Uploader/index.vue';
import MediaManager from '~/components/Media/Manager/index.vue';
import FormItemMedia from '~/components/FormItem/Media.vue';
import { Button } from '@/components/ui/button';

// Reactive data
const singleFile = ref<MediaFile | null>(null);
const multipleFiles = ref<MediaFile[]>([]);
const formMedia = ref<MediaFile[]>([]);
const showManager = ref(false);

// Helper function to format bytes
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle media selection from manager
const handleMediaSelect = (selectedFiles: MediaFile | MediaFile[]) => {
    if (Array.isArray(selectedFiles)) {
        multipleFiles.value = selectedFiles;
    } else {
        singleFile.value = selectedFiles;
    }
    showManager.value = false;
};
</script>
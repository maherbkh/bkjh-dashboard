<template>
    <div class="p-6 space-y-6">
        <h2 class="text-2xl font-bold">
            Media Components Test
        </h2>

        <!-- Single File Uploader -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">
                Single File Uploader
            </h3>
            <MediaUploader
                v-model="singleFile"
                label="Upload Single File"
                name="single-file"
                :allowed-types="['image']"
                :max-size="5"
                :max-files="1"
                :access-level="AccessLevel.PUBLIC"
                :collection-name="CollectionType.DEFAULT"
            />
            <div
                v-if="singleFile"
                class="p-4 bg-gray-100 rounded"
            >
                <p><strong>Selected File:</strong> {{ singleFile.filename }}</p>
                <p><strong>Size:</strong> {{ formatBytes(singleFile.size) }}</p>
            </div>
        </div>

        <!-- Multiple Files Uploader -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">
                Multiple Files Uploader
            </h3>
            <MediaUploader
                v-model="multipleFiles"
                label="Upload Multiple Files"
                name="multiple-files"
                :multiple="true"
                :allowed-types="['image', 'document']"
                :max-size="10"
                :max-files="5"
                :access-level="AccessLevel.PUBLIC"
                :collection-name="CollectionType.GALLERY"
            />
            <div
                v-if="multipleFiles && multipleFiles.length > 0"
                class="p-4 bg-gray-100 rounded"
            >
                <p><strong>Selected Files:</strong> {{ multipleFiles.length }}</p>
                <ul class="list-disc list-inside">
                    <li
                        v-for="file in multipleFiles"
                        :key="file.id"
                    >
                        {{ file.filename }} ({{ formatBytes(file.size) }})
                    </li>
                </ul>
            </div>
        </div>

        <!-- Media Manager -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">
                Media Manager
            </h3>
            <Button @click="handleOpenManager">
                Open Media Gallery
            </Button>
            <MediaManager
                v-model:open="showManager"
                v-model:selected-files="multipleFiles"
                :multiple="true"
                :max-selection="5"
                :allowed-types="['image']"
                :access-level="AccessLevel.PUBLIC"
                :collection-name="CollectionType.GALLERY"
                @select="handleMediaSelect"
            />
        </div>

        <!-- Form Item Media -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">
                Form Item Media
            </h3>
            <FormItemMedia
                v-model="formMedia"
                label="Form Media Field"
                name="form-media"
                :multiple="true"
                :allowed-types="['image', 'document']"
                :max-size="5"
                :max-files="3"
                :access-level="AccessLevel.PUBLIC"
                :collection-name="CollectionType.ATTACHMENTS"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MediaEntity } from '~/types/media/index';
import { AccessLevel, CollectionType } from '~/types/media/index';
import MediaUploader from '~/components/Media/Uploader/index.vue';
import MediaManager from '~/components/Media/Manager/index.vue';
import FormItemMedia from '~/components/FormItem/Media.vue';
import { Button } from '@/components/ui/button';

// Reactive data
const singleFile = ref<MediaEntity | null>(null);
const multipleFiles = ref<MediaEntity[]>([]);
const formMedia = ref<MediaEntity[]>([]);
const showManager = ref(false);

// Helper function to format bytes
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle opening the media manager
const handleOpenManager = () => {
    showManager.value = true;
};

// Handle media selection from manager
const handleMediaSelect = (selectedFiles: MediaEntity | MediaEntity[] | string | string[]) => {
    try {
        // Handle different selection types based on maxSelection
        if (typeof selectedFiles === 'string') {
            // Single selection - received media ID
            // You would need to fetch the full MediaEntity if needed
            showManager.value = false;
        }
        else if (Array.isArray(selectedFiles)) {
            // Multiple selection - check if it's MediaEntity[] or string[]
            if (selectedFiles.length > 0 && typeof selectedFiles[0] === 'string') {
                // String array - media IDs
                // You would need to fetch the full MediaEntity objects if needed
            }
            else {
                // MediaEntity array
                multipleFiles.value = [...selectedFiles] as MediaEntity[];
            }
            showManager.value = false;
        }
        else if (selectedFiles) {
            // Single selection - received MediaEntity
            singleFile.value = selectedFiles;
            showManager.value = false;
        }
    }
    catch (error) {
        showManager.value = false;
    }
};
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Ref, ComputedRef } from 'vue';

// File preview type
interface FilePreview {
    id?: number;
    url: string;
    name: string;
    type: string;
    urls?: { full?: string };
}

// Props type
interface FileUploaderProps {
    modelValue: FilePreview[] | number[] | null;
    allowedTypes: string[];
    maxSize: number;
    limit: number;
    uploadOnly: boolean;
    label: string | null;
    required: boolean;
    name: string | null;
    errors: string[];
    folderName?: 'event' | 'ticket' | 'profile' | null;
}

const props = defineProps<FileUploaderProps>();
const emit = defineEmits<(
    e: 'update:modelValue' | 'uploaded',
    value: FilePreview[],
) => void>();

const files: Ref<File[]> = ref([]);
const previews: Ref<FilePreview[]> = ref([]);
const uploading: Ref<boolean> = ref(false);
const uploadProgress: Ref<number[]> = ref([]);
const validationError: Ref<string> = ref('');
const dragActive: Ref<boolean> = ref(false);
const inputRef: Ref<HTMLInputElement | null> = ref(null);
const { t } = useI18n();

const isMultiple: ComputedRef<boolean> = computed(() => props.limit > 1);

// Map generic types to actual MIME types and file extensions
const typeMapping: Record<string, string[]> = {
    image: ['image/*'],
    document: [
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'application/vnd.oasis.opendocument.text',
    ],
    archive: [
        '.zip', '.rar', '.tar', '.gz', '.7z', '.bz2',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-tar',
        'application/gzip',
        'application/x-7z-compressed',
        'application/x-bzip2',
    ],
    video: ['video/*'],
    audio: ['audio/*'],
    text: ['text/*', '.txt', '.csv', '.json', '.xml'],
};

const acceptString: ComputedRef<string> = computed(() => {
    const acceptTypes: string[] = [];

    props.allowedTypes.forEach((type: string) => {
        if (type.includes('/')) {
            // Already a MIME type
            acceptTypes.push(type);
        }
        else if (typeMapping[type]) {
            // Map generic type to specific MIME types/extensions
            acceptTypes.push(...typeMapping[type]);
        }
        else {
            // Fallback: treat as MIME type prefix
            acceptTypes.push(`${type}/*`);
        }
    });

    return acceptTypes.join(',');
});

function onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const fileList = Array.from(input.files);
    addFiles(fileList);
}

function onDrop(event: DragEvent): void {
    event.preventDefault();
    dragActive.value = false;
    if (!event.dataTransfer?.files) return;
    addFiles(Array.from(event.dataTransfer.files));
}

function onDragOver(event: DragEvent): void {
    event.preventDefault();
    dragActive.value = true;
}
function onDragLeave(event: DragEvent): void {
    event.preventDefault();
    dragActive.value = false;
}

function openFileDialog(): void {
    inputRef.value?.click();
}

function addFiles(fileList: File[]): void {
    validationError.value = '';
    if (fileList.length + files.value.length > props.limit) {
        validationError.value = t('file_uploader.max_files', { limit: props.limit });
        return;
    }
    for (const file of fileList) {
        if (file.size > props.maxSize * 1024 * 1024) {
            validationError.value = t('file_uploader.file_too_large', { name: file.name, size: props.maxSize });
            return;
        }
        const isValidType = props.allowedTypes.some((type) => {
            if (type.includes('/')) {
                // Direct MIME type comparison
                return file.type === type;
            }
            else if (typeMapping[type]) {
                // Check against mapped types
                return typeMapping[type].some((mappedType) => {
                    if (mappedType.startsWith('.')) {
                        // File extension check
                        return file.name.toLowerCase().endsWith(mappedType.toLowerCase());
                    }
                    else if (mappedType.includes('*')) {
                        // Wildcard MIME type check
                        const prefix = mappedType.replace('/*', '');
                        return file.type.startsWith(prefix);
                    }
                    else {
                        // Exact MIME type check
                        return file.type === mappedType;
                    }
                });
            }
            else {
                // Fallback to prefix matching
                return file.type.startsWith(type);
            }
        });
        if (!isValidType) {
            validationError.value = t('file_uploader.file_type_invalid', { name: file.name });
            return;
        }
    }
    files.value.push(...fileList);
    // Generate previews for images
    fileList.forEach((file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                previews.value.push({ url: (e.target?.result as string) || '', name: file.name, type: file.type });
            };
            reader.readAsDataURL(file);
        }
        else {
            previews.value.push({ url: '', name: file.name, type: file.type });
        }
    });
}

function removeFile(index: number): void {
    files.value.splice(index, 1);
    previews.value.splice(index, 1);
}

// --- Fetch file objects if v-model is array of IDs ---
async function fetchFileById(id: number): Promise<FilePreview | null> {
    const { data } = await useApiFetch<any>(`/api/media/${id}`);
    const obj = data.value?.data;
    if (!obj) return null;
    return {
        id: obj.id,
        url: obj.url || obj.urls?.full || '',
        name: obj.name || obj.fileName || '',
        type: obj.mimeType || obj.type || '',
        urls: obj.urls,
    };
}

async function ensurePreviewsFromModel(): Promise<void> {
    if (!props.modelValue) return;
    previews.value = [];
    if (typeof props.modelValue[0] === 'object') {
        // Ensure all fields are strings
        previews.value = (props.modelValue as any[]).map(obj => ({
            id: obj.id,
            url: obj.url || obj.urls?.full || '',
            name: obj.name || obj.fileName || '',
            type: obj.mimeType || obj.type || '',
            urls: obj.urls,
        }));
    }
    else {
        // Array of IDs
        for (const id of props.modelValue as number[]) {
            if (typeof id !== 'number') continue;
            const obj = await fetchFileById(id);
            if (obj) previews.value.push(obj);
        }
    }
}
watch(() => props.modelValue, ensurePreviewsFromModel, { immediate: true });

// --- Upload logic (called on parent form submit) ---
async function uploadAll(): Promise<FilePreview[]> {
    if (!files.value.length) return [];
    uploading.value = true;
    uploadProgress.value = Array(files.value.length).fill(0);
    let uploadedFiles: FilePreview[] = [];
    try {
        // Use multiple upload if more than one file
        if (files.value.length > 1) {
            const formData = new FormData();
            files.value.forEach(file => formData.append('files[]', file));

            if (props.folderName) {
                formData.append('location', props.folderName);
            }
            const { data, error } = await useApiFetch<any>('/api/media/upload-multiple', {
                method: 'POST',
                body: formData,
            });
            if (error.value) throw error.value;
            // Check if response has data.uploaded array (for multiple upload)
            const uploadedArray = data.value.data?.uploaded || data.value.data || [];
            uploadedFiles = uploadedArray.map((obj: any) => ({
                id: obj.id,
                url: obj.url || obj.urls?.full || '',
                name: obj.name || obj.fileName || '',
                type: obj.mimeType || obj.type || '',
                urls: obj.urls,
            }));
        }
        else {
            // Single file
            const formData = new FormData();
            if (files.value[0]) {
                formData.append('file', files.value[0]);
            }

            if (props.folderName) {
                formData.append('location', props.folderName);
            }
            const { data, error } = await useApiFetch<any>('/api/media/upload', {
                method: 'POST',
                body: formData,
            });
            if (error.value) throw error.value;
            const obj = data.value.data;
            uploadedFiles = [{
                id: obj.id,
                url: obj.url || obj.urls?.full || '',
                name: obj.name || obj.fileName || '',
                type: obj.mimeType || obj.type || '',
                urls: obj.urls,
            }];
        }
        emit('update:modelValue', uploadedFiles);
        emit('uploaded', uploadedFiles);
        files.value = [];
        previews.value = [];
        return uploadedFiles;
    }
    catch (err: any) {
        validationError.value = err.message || t('file_uploader.upload_failed');
        return [];
    }
    finally {
        uploading.value = false;
    }
}

function getFileIcon(type: string, name: string): string {
    if (type.startsWith('image/')) return '';
    if (type === 'application/pdf') return 'solar:document-linear';
    if (type.includes('zip') || name.endsWith('.zip')) return 'solar:archive-linear';
    if (type.includes('doc') || name.endsWith('.doc') || name.endsWith('.docx')) return 'solar:document-linear';
    if (type.includes('xls') || name.endsWith('.xls') || name.endsWith('.xlsx')) return 'solar:table-linear';
    if (type.includes('ppt') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'solar:presentation-linear';
    return 'solar:file-linear';
}

// Expose functions to parent component
defineExpose({
    uploadAll,
});
</script>

<template>
    <div>
        <label
            v-if="label"
            :for="name || undefined"
            class="block mb-1 font-medium"
        >
            {{ label }} <span
                v-if="required"
                class="text-red-500"
            >*</span>
        </label>
        <div
            class="border border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
            :class="{
                'border-primary bg-primary/10': dragActive,
                'border-gray-500 hover:border-primary/50': !dragActive,
                'opacity-50 cursor-not-allowed': uploading,
            }"
            @click="!uploading && openFileDialog()"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
        >
            <input
                :id="name || undefined"
                ref="inputRef"
                :name="name || undefined"
                type="file"
                :multiple="isMultiple"
                :accept="acceptString"
                class="hidden"
                :disabled="uploading"
                @change="onFileChange"
            >
            <div class="flex flex-col items-center gap-0.5">
                <Icon
                    name="solar:cloud-upload-line-duotone"
                    class="!size-8 shrink-0"
                />
                <span class="font-medium text-primary">{{ t('file_uploader.click_to_upload') }}</span>
                <span class="text-muted-foreground">{{ t('file_uploader.or_drag_drop') }}</span>
                <span class="text-xs text-muted-foreground">
                    {{ t('file_uploader.allowed', { types: allowedTypes.join(', '), size: maxSize, limit }) }}
                </span>
            </div>
        </div>

        <!-- File Previews -->
        <ul
            v-if="previews.length"
            class="mt-4 flex flex-col divide-y divide-dashed"
        >
            <li
                v-for="(file, idx) in previews"
                :key="file.name + idx"
                class="flex gap-4 items-center justify-between py-1.5"
            >
                <div
                    v-if="file.url && file.type && file.type.startsWith('image/')"
                    class="size-10 rounded-lg border bg-muted overflow-hidden flex items-center justify-center"
                >
                    <img
                        :src="((file.url || (file.urls && file.urls.full) || '') ?? '') as string"
                        :alt="((file.name || '') ?? '') as string"
                        class="object-cover w-full h-full"
                    >
                </div>
                <div
                    v-else
                    class="size-10 rounded-lg border bg-muted flex items-center justify-center"
                >
                    <Icon
                        v-if="getFileIcon(file.type, file.name)"
                        :name="getFileIcon(file.type, file.name)"
                        class="shrink-0 !size-8 text-muted-foreground/50"
                    />
                </div>
                <div class="grow text-xs flex flex-col gap-0.5">
                    <div class=" truncate">
                        {{ file.name }}
                    </div>
                    <div class="text-muted-foreground/50">
                        {{ file.type }}
                    </div>
                </div>
                <Button
                    v-if="!uploading"
                    size="icon"
                    variant="ghost"
                    class="hover:scale-110"
                    @click="removeFile(idx)"
                >
                    <Icon
                        name="solar:trash-bin-minimalistic-outline"
                        class="shrink-0 !size-4 text-red-400"
                    />
                </Button>
            </li>
        </ul>

        <div
            v-if="validationError"
            class="text-red-500 text-xs mt-1"
        >
            {{ validationError }}
        </div>
        <div
            v-if="uploading"
            class="text-primary text-xs mt-1"
        >
            {{ t('file_uploader.uploading') }}
        </div>
        <slot />
    </div>
</template>

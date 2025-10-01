### Uploader with Manager

```
<script setup>
const props = defineProps({
    label: {
        type: String,
        default: null,
    },
    name: {
        type: String,
        default: null,
    },
    required: {
        type: Boolean,
        default: false,
    },
    edit: {
        type: Boolean,
        default: true,
    },
    flexTitle: {
        type: Boolean,
        default: false,
    },
    modelValue: {
        type: Object || Array || null,
        default: null,
    },
    allowedTypes: {
        type: Array,
        required: true,
        default: () => [], // Default allowed file types
    },
    errors: {
        type: Array,
        default: () => [], // Default allowed file types
    },
    maxSize: {
        type: Number,
        default: 5, // Default to 5 MB
    },
    limit: {
        type: Number,
        default: 1,
    },
});
const validationError = ref(false);
const maxSizeMessage = ref(false);
const maxFileTypeMessage = ref(false);
const allowRemovingFiles = ref(false);

const types = {
    image: ['image/gif', 'image/png', 'image/webp', 'image/jpeg', 'image/jpg'],
    svg: ['image/svg+xml'],
    audio: ['audio/mpeg', 'audio/aac', 'audio/wav'],
    video: ['video/mp4', 'video/webm', 'video/mpeg', 'video/x-msvideo'],
    document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'],
    archive: ['application/zip', 'application/x-7z-compressed', 'application/gzip', 'application/vnd.rar'],
};
function getSubtypes(category) {
    const subtypes = [];
    const categoryTypes = types[category];

    if (categoryTypes) {
        categoryTypes.forEach((type) => {
            const typeRegex = /\/(.+)$/;
            const match = type.match(typeRegex);
            if (match) {
                subtypes.push(match[1]);
            }
        });
    }

    return subtypes;
}

function resetErrors() {
    maxSizeMessage.value = false;
    maxFileTypeMessage.value = false;
    validationError.value = false;
}
function validateFile($event) {
    const fileInput = $event instanceof DragEvent ? $event.dataTransfer?.files?.[0] : $event.target instanceof HTMLInputElement ? $event.target.files?.[0] : undefined;
    resetErrors();

    let isValid = true;

    if (!fileInput) {
        isValid = false;
    }

    // Check file size
    if (fileInput?.size && fileInput.size > props.maxSize * 1024 * 1024) {
        maxSizeMessage.value = true;
        isValid = false;
    }

    // Check file type
    const isValidType = props.allowedTypes.some((category) => {
        const categoryTypes = types[category];
        return categoryTypes && categoryTypes.includes(fileInput?.type || '');
    });

    if (!isValidType) {
        maxFileTypeMessage.value = true;
        isValid = false;
    }

    return isValid;
}
function validateFiles($event) {
    const fileInputs = $event instanceof DragEvent ? $event.dataTransfer?.files : $event.target instanceof HTMLInputElement ? $event.target.files : undefined;
    resetErrors();

    let isValid = true;

    if (!fileInputs || fileInputs.length === 0) {
        isValid = false;
    }

    for (const fileInput of fileInputs) {
        // Check file size
        if (fileInput.size > props.maxSize * 1024 * 1024) {
            maxSizeMessage.value = true;
            isValid = false;
        }

        // Check file type
        const isValidType = props.allowedTypes.some((category) => {
            const categoryTypes = types[category];
            return categoryTypes && categoryTypes.includes(fileInput.type);
        });

        if (!isValidType) {
            maxFileTypeMessage.value = true;
            isValid = false;
        }
    }

    return isValid;
}

const emit = defineEmits(['update:model-value']);
const dragging = ref(false);
const uploading = ref(false);

const file = ref();
const value = ref(props.limit > 1 ? (props.modelValue ? props.modelValue : []) : props.modelValue ? props.modelValue.id : null);

async function onDropFile($event) {
    if (!validateFile($event)) {
        validationError.value = true;
        dragging.value = false;
        return;
    }
    resetErrors();
    uploading.value = true;
    const fileInput = $event.dataTransfer?.items[0]?.getAsFile();
    if (fileInput) {
        const formData = new FormData();
        formData.append('file', fileInput);

        const { data } = await useApiFetch('/api/media', {
            method: 'POST',
            body: formData,
            lazy: true,
        });

        if (data && data.value) {
            file.value = data.value;
            value.value = data.value.id;
            emit('update:model-value', value.value);
            uploading.value = false;
            dragging.value = false;
        }
    }
}

async function onUploadFile($event) {
    if (!validateFile($event)) {
        validationError.value = true;
        return;
    }
    resetErrors();
    uploading.value = true;

    const fileInput = $event.target;
    const formData = new FormData();

    if (fileInput.files && fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    } else {
        // Handle case where there are no files
        return;
    }

    const { data } = await useApiFetch('/api/media', {
        method: 'POST',
        body: formData,
        lazy: true,
    });

    if (data && data.value) {
        file.value = data.value.data;
        value.value = data.value.data.id;
        emit('update:model-value', value.value);
        uploading.value = false;
    }
}
async function onUploadFiles($event) {
    if (!validateFiles($event)) {
        validationError.value = true;
        return;
    }
    resetErrors();
    uploading.value = true;
    const filesInput = $event.target;
    const formData = new FormData();

    if (filesInput.files && filesInput.files.length > 0) {
        for (let i = 0; i < filesInput.files.length; i++) {
            formData.append('files[]', filesInput.files[i]);
        }
    } else {
        // Handle case where there are no files
        return;
    }

    const { data } = await useApiFetch('/api/media-upload-many', {
        method: 'POST',
        body: formData,
        lazy: true,
    });

    if (data && data.value) {
        const newFiles = data.value.data;
        const existingFiles = value.value || [];
        const existingFileIds = new Set(existingFiles.map((file) => file.id));

        // Merge new files with existing ones, avoiding duplicates
        newFiles.forEach((file) => {
            if (!existingFileIds.has(file.id)) {
                existingFiles.push(file);
                existingFileIds.add(file.id);
            }
        });

        file.value = existingFiles;
        value.value = existingFiles;
        emit('update:model-value', value.value);
        uploading.value = false;
    }
}

watchEffect(() => {
    value.value = props.limit > 1 ? (props.modelValue ? props.modelValue : []) : props.modelValue ? props.modelValue.id : null;
});

async function getFile(id) {
    uploading.value = true;
    const { data } = await useApiFetch(`/api/get-media/${id}`);
    if (data && data.value.data) {
        file.value = data.value.data;
        uploading.value = false;
    }
}

async function getFiles(ids) {
    uploading.value = true;
    const { data } = await useApiFetch(`/api/media-array`, {
        method: 'POST',
        body: {
            images: ids,
        },
    });
    if (data && data.value) {
        file.value = data.value.data;
        uploading.value = false;
    }
}

watch(
    () => props.modelValue,
    (newVal, oldVal) => {
        if (props.limit > 1) {
            if (newVal !== oldVal) {
                value.value = newVal && newVal.id !== undefined ? newVal : null;
            } else if (newVal === undefined || newVal === null) {
                value.value = [];
            }
        } else {
            if (newVal !== oldVal) {
                value.value = newVal && newVal.id !== undefined ? newVal.id : null;
            } else if (newVal === undefined || newVal === null) {
                value.value = null;
            }
        }
    },
);

function removeFile() {
    uploading.value = true;
    file.value = null;
    value.value = null;
    emit('update:model-value', value.value);
    uploading.value = false;
}

function removeFileFromArray(index) {
    uploading.value = true;
    file.value.splice(index, 1);
    value.value = file.value;
    emit('update:model-value', value.value);
    uploading.value = false;
}

const isLoading = ref(true);

onMounted(async () => {
    isLoading.value = true;
    if (props.limit === 1) {
        if (value.value) {
            await getFile(value.value);
        }
    } else {
        if (value.value.length > 0) {
            const idsArray = value.value.map((item) => item.id);
            await getFiles(idsArray);
        }
    }

    props.allowedTypes.forEach((type) => {
        if (typeof type === 'string') {
            getSubtypes(type);
        }
    });
    isLoading.value = false;
});

// Media Gallery Modal
const mediaGalleryParams = ref({
    page: 1,
    length: 24,
    search: null,
});

const resetMediaGalleryParams = async () => {
    mediaGalleryParams.value = {
        page: 1,
        length: 24,
        search: null,
    };
};

const {
    data: images,
    error,
    status,
    refresh,
} = await useApiFetch(`/api/media`, {
    immediate: false,
    params: mediaGalleryParams.value,
    lazy: true,
    transform: (images) => images.data,
});
const selectedMediaFiles = ref([]);
const formLoading = ref(false);
const isOpen = ref(false);
async function closeModal() {
    isOpen.value = false;
    selectedMediaFiles.value = [];
}
async function openModal() {
    formLoading.value = true;
    selectedMediaFiles.value = [];
    await refresh();
    isOpen.value = true;
    formLoading.value = false;
}
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)));
    return Math.round(100 * (bytes / Math.pow(k, i))) / 100 + ' ' + sizes[i];
}
const changePage = async (value) => {
    const pageNumber = parseInt(value);
    if (!isNaN(pageNumber)) {
        mediaGalleryParams.value.page = pageNumber;
    } else {
        console.error('Invalid page number:', value);
    }
    await refresh();
};
const handleSearchAction = async () => {
    mediaGalleryParams.value.page = 1;
    await refresh();
};
const resetImages = async () => {
    mediaGalleryParams.value.page = 1;
    mediaGalleryParams.value.search = null;
    await refresh();
};

const toggleMediaSelection = (selectedMediaItem) => {
    if (props.limit === 1) {
        selectedMediaFiles.value = [];
        selectedMediaFiles.value.push(selectedMediaItem);
    } else if (props.limit > 1) {
        const index = selectedMediaFiles.value.findIndex((item) => item.id === selectedMediaItem.id);
        if (index === -1) {
            selectedMediaFiles.value.push(selectedMediaItem);
        } else {
            selectedMediaFiles.value.splice(index, 1);
        }
    }
};

const isSelected = (id) => {
    if (props.limit === 1) {
        return selectedMediaFiles.value.length > 0 && selectedMediaFiles.value[0].id === id;
    }
    return selectedMediaFiles.value.some(({ id: mediaId }) => mediaId === id);
};

const isOriginal = (id) => {
    if (props.limit === 1) {
        return value.value === id;
    }
    return value.value.some(({ id: mediaId }) => mediaId === id);
};

const insertMedia = async () => {
    if (props.limit === 1) {
        if (selectedMediaFiles.value.length > 0) {
            file.value = selectedMediaFiles.value[0];
            value.value = selectedMediaFiles.value[0];
            emit('update:model-value', value.value);
            await closeModal();
        }
    } else if (props.limit > 1) {
        if (selectedMediaFiles.value.length > 0) {
            const newFiles = selectedMediaFiles.value;
            const existingFiles = value.value || [];
            const existingFileIds = new Set(existingFiles.map((file) => file.id));

            // Merge new files with existing ones, avoiding duplicates
            newFiles.forEach((file) => {
                if (!existingFileIds.has(file.id)) {
                    existingFiles.push(file);
                    existingFileIds.add(file.id);
                }
            });
            file.value = existingFiles;
            value.value = existingFiles;
            emit('update:model-value', value.value);
            await closeModal();
        }
    }
};
</script>
<template>
    <div class="relative" @drop.prevent="onDropFile" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false">
        <div :class="limit > 1 && 'flex items-center gap-5 justify-between'">
            <div v-if="label" class="form-label opacity-75 font-light" :class="[flexTitle ? '!text-left sm:w-20' : '']">
                <span>{{ label }}</span>
                <span v-if="label && required" class="ml-1 text-sm text-danger">*</span>
            </div>
            <template v-if="props.edit">
                <div v-if="limit > 1" class="flex items-center gap-5">
                    <FormSwitch v-model="allowRemovingFiles" flex-title label="Allow Removing files" />
                    <label :for="name + '-update-files'" class="btn btn-primary btn-sm btn-rounded whitespace-nowrap btn-sm gap-2">
                        <Icon name="solar:gallery-send-broken" class="size-4 shrink-0" />
                        <span class="font-semibold">Update Images</span>
                        <input :id="name + '-update-files'" multiple :name="name + '-update-files'" type="file" class="sr-only" @change="onUploadFiles" />
                    </label>
                    <button type="button" class="btn btn-dark gap-2 btn-sm btn-rounded whitespace-nowrap" @click="openModal">
                        <Icon name="solar:folder-open-outline" class="size-4 shrink-0" />
                        Media Library
                    </button>
                </div>
            </template>
        </div>
        <template v-if="limit === 1">
            <div v-if="file && file.fullUrl" class="relative border-dashed border group bg-white flex justify-center ease-in-out duration-300 px-6 pt-5 pb-6 rounded-xl">
                <div v-if="props.edit" class="absolute inset-0 hidden group-hover:flex group-hover:flex-col items-center justify-center z-10 ease-in-out duration-300 group gap-5">
                    <label :for="name + '-update-file'" class="btn btn-primary btn-sm btn-rounded whitespace-nowrap btn-sm">
                        <Icon name="solar:gallery-send-broken" class="h-4 w-4 mr-2" />
                        <span class="font-semibold">Update Image</span>
                        <input :id="name + '-update-file'" :name="name + '-update-file'" type="file" class="sr-only" @change="onUploadFile" />
                    </label>
                    <button type="button" class="btn btn-dark gap-2 btn-sm btn-rounded whitespace-nowrap" @click="openModal">
                        <Icon name="solar:folder-open-outline" class="size-4 shrink-0" />
                        Media Library
                    </button>
                    <button type="button" class="btn btn-danger btn-sm btn-rounded group btn-sm" @click="removeFile">
                        <Icon name="clarity:close-line" class="mr-2 w-4 h-4" />
                        <span>Remove</span>
                    </button>
                </div>
                <NuxtImg :src="file.fullUrl" alt="company-logo" :class="props.edit && 'group-hover:blur-md'" class="z-5 w-full h-36 object-contain ease-in-out duration-300" />
            </div>
            <div v-else-if="uploading" class="bg-white flex justify-center ease-in-out duration-300 px-6 pt-5 pb-6 rounded-xl min-h-36">
                <Icon name="eos-icons:three-dots-loading" class="h-14 w-14" />
            </div>
            <div v-else :class="label ? 'mt-2' : ''">
                <div
                    :class="[
                        validationError || props.errors.length > 0 ? '!border-dashed !border-danger' : '',
                        dragging ? 'border-solid !border-primary bg-primary/25' : 'border-dashed border-slate-300 dark:!border-slate-600',
                        'border-2 flex justify-center ease-in-out duration-300 px-6 pt-5 pb-6 rounded-xl min-h-36',
                    ]"
                >
                    <div v-if="props.edit" class="space-y-2 text-center">
                        <Icon name="solar:gallery-send-broken" class="mx-auto h-12 w-12 text-slate-400" />
                        <div class="text-sm space-y-2">
                            <label :for="name" class="relative btn btn-sm btn-primary whitespace-nowrap">
                                <span>Upload a file</span>
                                <input :id="name" :name="name" type="file" class="sr-only" @change="onUploadFile" />
                            </label>
                            <p class="pl-1">or drag and drop 2</p>
                        </div>
                        <div class="text-xs text-slate-400 text-center">
                            <span v-for="(allowedType, index) in props.allowedTypes" :key="index">
                                <template v-for="(mimeType, mimeIndex) in getSubtypes(allowedType)" :key="mimeIndex">
                                    <span class="uppercase font-light">{{ mimeType }}{{ mimeIndex < getSubtypes(allowedType).length - 1 ? ', ' : '' }}</span>
                                </template>
                                {{ index < props.allowedTypes.length - 1 ? ', ' : '' }}
                            </span>
                            <div class="mt-1">
                                <span class="mx-1">Max file size is: </span>
                                <span class="font-semibold">{{ props.maxSize + ' MB' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template v-if="props.errors.length > 0 || validateFile">
                <ul class="mt-3 text-sm text-danger divide-y divide-dashed !divide-danger/25 font-medium">
                    <li v-if="maxSizeMessage" class="py-2">{{ 'Maximum size is ' + props.maxSize + ' MB' }}</li>
                    <li v-if="maxFileTypeMessage" class="py-2">
                        <span>Allowed Types:</span>
                        <span v-for="(allowedType, index) in props.allowedTypes" :key="index" class="ml-1">
                            <template v-for="(mimeType, mimeIndex) in getSubtypes(allowedType)" :key="mimeIndex">
                                <span class="uppercase font-semibold">{{ mimeType }}{{ mimeIndex < getSubtypes(allowedType).length - 1 ? ', ' : '' }}</span>
                            </template>
                            {{ index < props.allowedTypes.length - 1 ? ', ' : '' }}
                        </span>
                    </li>
                    <template v-if="errors.length > 0">
                        <li v-for="(error, errorIndex) in errors" :key="errorIndex" class="py-2">{{ error.$message }}</li>
                    </template>
                </ul>
            </template>
        </template>
        <div v-else class="mt-3">
            <div v-if="file && file.length > 0" class="relative border-dashed border bg-white flex justify-center ease-in-out duration-300 px-6 pt-5 pb-6 rounded-xl">
                <ul :class="[file.length <= 12 && 'grid-cols-6', file.length > 12 && 'grid-cols-12', 'grid gap-5']">
                    <li v-for="(img, index) in file" :key="index" class="relative hover:scale-110 transition-all group">
                        <div v-if="allowRemovingFiles" class="transition-all absolute inset-0 hidden group-hover:flex group-hover:flex-col items-center justify-center z-10 group gap-5">
                            <button type="button" class="btn btn-danger btn-sm btn-rounded group btn-sm gap-2" @click="removeFileFromArray(index)">
                                <Icon name="clarity:close-line" class="w-4 h-4" />
                                <span v-if="file.length <= 12">Remove</span>
                            </button>
                        </div>
                        <NuxtImg :src="img.fullUrl" :alt="img.name" :title="img.name" :class="file.length > 12 ? 'h-12' : 'h-36'" class="z-5 w-full rounded-md object-cover ease-in-out duration-300" />
                    </li>
                </ul>
            </div>
            <div v-else-if="uploading" class="bg-white flex justify-center ease-in-out duration-300 px-6 pt-5 pb-6 rounded-xl min-h-36">
                <Icon name="eos-icons:three-dots-loading" class="h-14 w-14" />
            </div>
            <div v-else :class="label ? 'mt-2' : ''">
                <div
                    :class="[
                        validationError || props.errors.length > 0 ? '!border-dashed !border-danger' : '',
                        dragging ? 'border-solid !border-primary bg-primary/25' : 'border-dashed border-slate-300 dark:!border-slate-600',
                        'border-2 flex justify-center ease-in-out duration-300 px-6 pt-5 pb-6 rounded-xl min-h-36',
                    ]"
                >
                    <div v-if="props.edit" class="space-y-2 text-center">
                        <Icon name="solar:gallery-send-broken" class="mx-auto h-12 w-12 text-slate-400" />
                        <div class="text-sm space-y-2">
                            <label :for="name" class="relative btn btn-sm btn-primary whitespace-nowrap">
                                <span>Upload a file</span>
                                <input :id="name" :name="name" type="file" class="sr-only" multiple @change="onUploadFiles" />
                            </label>
                            <p class="pl-1">or drag and drop</p>
                        </div>
                        <div class="text-xs text-slate-400 text-center">
                            <span v-for="(allowedType, index) in props.allowedTypes" :key="index">
                                <template v-for="(mimeType, mimeIndex) in getSubtypes(allowedType)" :key="mimeIndex">
                                    <span class="uppercase font-light">{{ mimeType }}{{ mimeIndex < getSubtypes(allowedType).length - 1 ? ', ' : '' }}</span>
                                </template>
                                {{ index < props.allowedTypes.length - 1 ? ', ' : '' }}
                            </span>
                            <div class="mt-1">
                                <span class="mx-1">Max file size is: </span>
                                <span class="font-semibold">{{ props.maxSize + ' MB' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template v-if="props.errors.length > 0 || validateFile">
                <ul class="mt-3 text-sm text-danger divide-y divide-dashed !divide-danger/25 font-medium">
                    <li v-if="maxSizeMessage" class="py-2">{{ 'Maximum size is ' + props.maxSize + ' MB' }}</li>
                    <li v-if="maxFileTypeMessage" class="py-2">
                        <span>Allowed Types:</span>
                        <span v-for="(allowedType, index) in props.allowedTypes" :key="index" class="ml-1">
                            <template v-for="(mimeType, mimeIndex) in getSubtypes(allowedType)" :key="mimeIndex">
                                <span class="uppercase font-semibold">{{ mimeType }}{{ mimeIndex < getSubtypes(allowedType).length - 1 ? ', ' : '' }}</span>
                            </template>
                            {{ index < props.allowedTypes.length - 1 ? ', ' : '' }}
                        </span>
                    </li>
                    <template v-if="errors.length > 0">
                        <li v-for="(error, errorIndex) in errors" :key="errorIndex" class="py-2">{{ error.$message }}</li>
                    </template>
                </ul>
            </template>
        </div>
        <TheModal :open-modal="isOpen" size="5xl" @close-modal="closeModal()">
            <template #header>
                <div class="flex justify-between items-center gap-8">
                    <div class="font-medium">Media Gallery</div>
                    <Icon class="w-8 h-8 opacity-50 cursor-pointer hover:opacity-100 ease-in-out duration-300" name="solar:close-square-outline" @click="closeModal" />
                </div>
            </template>
            <template #content>
                <div>
                    <form class="flex items-center gap-5 grow p-5 mx-auto max-w-3xl bg-slate-50 rounded-full mb-5" @submit.prevent="handleSearchAction">
                        <FormInputField v-model="mediaGalleryParams.search" placeholder="Search for..." class="grow" />
                        <button :disabled="formLoading" class="btn-rounded btn-sm btn btn-primary px-4 gap-2" type="submit">
                            <Icon :name="formLoading ? 'svg-spinners:3-dots-fade' : 'solar:rounded-magnifer-outline'" class="size-5" />
                            <span v-html="'Search'" />
                        </button>
                        <button :disabled="formLoading" class="btn-rounded btn-sm btn btn-secondary px-4 gap-2" type="button" @click="resetImages">
                            <Icon :name="formLoading ? 'svg-spinners:3-dots-fade' : 'solar:restart-line-duotone'" class="size-5" />
                            <span v-html="'Reset'" />
                        </button>
                    </form>
                    <div v-if="status !== 'pending'" class="grid lg:grid-cols-8 sm:grid-cols-6 gap-5 items-start">
                        <template v-if="images.data.length > 0">
                            <div
                                v-for="(img, i) in images.data"
                                :key="i"
                                :class="{
                                    '!ring-primary/80 ring-offset-2 ring-2': isSelected(img.id),
                                    'opacity-25': isOriginal(img.id),
                                    'shadow-sm p-2 relative group rounded-xl border hover:scale-110 transition-all cursor-pointer': true,
                                }"
                                @click="isOriginal(img.id) ? null : toggleMediaSelection(img)"
                            >
                                <NuxtImg :src="img.fullUrl" :alt="img.name" :title="img.name" class="z-5 h-14 w-14 group-hover:w-full mx-auto rounded-xl object-cover group-hover:object-contain transition-all bg-white" />
                                <div class="text-xs mt-3 text-center">
                                    <div class="truncate font-medium">{{ img.name }}</div>
                                    <div class="truncate font-light">{{ formatBytes(img.size) }}</div>
                                    <div class="truncate font-light">{{ img.mimeType }}</div>
                                </div>
                            </div>
                        </template>
                        <div v-else class="lg:col-span-12 text-center p-8 m-5 border-2 border-dashed rounded-2xl opacity-75">
                            <div>Oops! There is no media found matches your search</div>
                            <div class="text-sm font-light">Try to type another search or navigate with pages</div>
                        </div>
                    </div>
                    <div v-else class="grid lg:grid-cols-8 sm:grid-cols-6 gap-5 items-start">
                        <div v-for="placeholder in 24" :key="placeholder" class="bg-slate-100 animate-pulse h-32 w-full rounded-xl border" />
                    </div>
                    <div v-if="images.data" class="flex items-center justify-between gap-5 text-sm mt-5 px-6">
                        <button type="button" :disabled="images.current_page === 1" class="btn-secondary btn" @click="changePage(mediaGalleryParams.page - 1)">
                            <Icon class="mr-2 w-5 h-5" name="solar:double-alt-arrow-left-line-duotone" />
                            Previous
                        </button>
                        <ul class="md:flex items-center gap-3 hidden">
                            <template v-for="(link, pageIndex) in images.links" :key="pageIndex">
                                <li v-if="pageIndex !== 0 && pageIndex !== images.links.length - 1">
                                    <button type="button" :class="[link.active ? 'btn-primary' : 'btn-secondary', 'btn']" :disabled="images.current_page === parseInt(link.label) || link.label === '...'" @click="changePage(link.label)">
                                        {{ link.label }}
                                    </button>
                                </li>
                            </template>
                        </ul>
                        <button type="button" :disabled="images.current_page === images.last_page" class="btn-secondary btn" @click="changePage(mediaGalleryParams.page + 1)">
                            Next
                            <Icon class="ml-2 w-5 h-5" name="solar:double-alt-arrow-right-line-duotone" />
                        </button>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex items-center gap-5 justify-between">
                    <div class="flex items-center gap-3 flex-wrap w-full grow whitespace-nowrap">
                        <template v-for="(img, index) in selectedMediaFiles" :key="index">
                            <template v-if="index < 7">
                                <NuxtImg :src="img.fullUrl" :alt="img.name" :title="img.name" class="ring !ring-slate-400/25 size-12 rounded-full object-cover" />
                            </template>
                        </template>
                        <template v-if="selectedMediaFiles.length > 7">
                            <div class="flex place-content-center items-center text-xs text-center size-12">
                                <div>+{{ selectedMediaFiles.length - 7 }} more</div>
                            </div>
                        </template>
                    </div>
                    <div class="w-full flex items-center justify-end gap-5">
                        <button :disabled="formLoading" class="btn-rounded btn-sm btn btn-danger px-4" type="button" @click="closeModal">
                            <Icon :name="formLoading ? 'svg-spinners:3-dots-fade' : 'solar:close-circle-linear'" class="w-5 h-5 mr-2" />
                            <span>Close</span>
                        </button>
                        <button :disabled="formLoading" class="btn-rounded btn-sm btn btn-primary px-4" type="button" @click="insertMedia">
                            <Icon :name="formLoading ? 'svg-spinners:3-dots-fade' : 'solar:file-download-linear'" class="w-5 h-5 mr-2" />
                            <span>Insert Selected Media ({{ selectedMediaFiles.length }})</span>
                        </button>
                    </div>
                </div>
            </template>
        </TheModal>
    </div>
</template>

```


Backend API documentation:


Here are all the dashboard media APIs with examples:

## 📁 **Dashboard Media APIs**

### **1. Upload Single File**
```bash
POST /api/v1/dashboard/shared/media/upload
Content-Type: multipart/form-data

# Form data:
file: [image file]
accessLevel: "SELF"
collectionName: "avatar"
modelType: "Admin"
modelId: "admin-uuid-here"
directory: "avatars"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media-uuid",
    "uuid": "public-uuid",
    "filename": "profile.jpg",
    "mimeType": "image/jpeg",
    "size": "1024000",
    "url": "/api/media/public-uuid/show",
    "accessLevel": "SELF",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

### **2. Upload Multiple Files**
```bash
POST /api/v1/dashboard/shared/media/upload-many
Content-Type: multipart/form-data

# Form data:
files: [file1, file2, file3]
accessLevel: "SUPPORT"
collectionName: "gallery"
modelType: "Event"
modelId: "event-uuid-here"
directory: "events"
```

### **3. List Media with Filters**
```bash
GET /api/v1/dashboard/shared/media?page=1&length=25&search=profile&accessLevel=SELF&authId=admin-uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "media-uuid",
        "filename": "profile.jpg",
        "mimeType": "image/jpeg",
        "size": "1024000",
        "url": "/api/media/public-uuid/show"
      }
    ],
    "total": 1,
    "page": 1,
    "length": 25
  }
}
```

### **4. Get Media Details**
```bash
GET /api/v1/dashboard/shared/media/media-uuid-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media-uuid",
    "uuid": "public-uuid",
    "filename": "profile.jpg",
    "mimeType": "image/jpeg",
    "size": "1024000",
    "width": 800,
    "height": 600,
    "altText": "Profile picture",
    "title": "User Avatar",
    "description": "Profile photo",
    "accessLevel": "SELF",
    "authId": "admin-uuid",
    "authType": "ADMIN",
    "directory": "avatars",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

### **5. Update Media Metadata**
```bash
PATCH /api/v1/dashboard/shared/media/media-uuid-here
Content-Type: application/json

{
  "title": "New Title",
  "description": "Updated description",
  "altText": "Updated alt text"
}
```

### **6. Delete Media**
```bash
DELETE /api/v1/dashboard/shared/media/media-uuid-here
```

**Response:**
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

### **7. Attach Media to Model**
```bash
POST /api/v1/dashboard/shared/media/media-uuid-here/attach
Content-Type: application/json

{
  "modelType": "Admin",
  "modelId": "admin-uuid-here",
  "collectionName": "avatar",
  "sortOrder": 0
}
```

### **8. Detach Media from Model**
```bash
DELETE /api/v1/dashboard/shared/media/media-uuid-here/detach
Content-Type: application/json

{
  "modelType": "Admin",
  "modelId": "admin-uuid-here",
  "collectionName": "avatar"
}
```

### **9. Get Model's Media**
```bash
# Get all media for a model
GET /api/v1/dashboard/shared/media/model/Admin/admin-uuid-here

# Get specific collection
GET /api/v1/dashboard/shared/media/model/Admin/admin-uuid-here/avatar

# Get gallery collection
GET /api/v1/dashboard/shared/media/model/Event/event-uuid-here/gallery
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "media-uuid",
      "filename": "profile.jpg",
      "url": "/api/media/public-uuid/show",
      "collectionName": "avatar",
      "sortOrder": 0
    }
  ]
}
```

## 🌐 **Public Media Access APIs**

### **10. View/Stream File**
```bash
GET /api/media/public-uuid-here/show
```

### **11. Download File**
```bash
GET /api/media/public-uuid-here/download
```

### **12. Get File Info**
```bash
GET /api/media/public-uuid-here/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "public-uuid",
    "filename": "profile.jpg",
    "mimeType": "image/jpeg",
    "size": "1024000",
    "width": 800,
    "height": 600,
    "url": "/api/media/public-uuid/show"
  }
}
```

## 🔐 **Access Levels**
- **SELF**: Only uploader + superadmin
- **SUPPORT**: Admin with 'support' in apps + superadmin  
- **ACADEMY**: Admin with 'academy' in apps + superadmin
- **PUBLIC**: No authentication required

## 📝 **Collection Types**
- **avatar**: Single item (replaces existing)
- **cover**: Single item (replaces existing)
- **gallery**: Multiple items
- **attachments**: Multiple items
- **documents**: Multiple items
- **default**: Default collection

All these APIs are already available in your dashboard! 🚀





### validation rules

Let me check the validation rules for the media APIs by examining the DTOs and validation logic:


[5 tools called]

## 📋 **Dashboard Media API Validations**

Here are all the validation rules for your dashboard media APIs:

## 🔐 **Authentication & Authorization**

### **Required Guards:**
- `JwtAuthGuard` - JWT token required
- `MediaUploadGuard` - Additional upload permissions
- `AdminGuard` - Admin access required

### **Access Level Permissions:**
- **SELF**: Only uploader + superadmin
- **SUPPORT**: Admin with 'support' in apps + superadmin  
- **ACADEMY**: Admin with 'academy' in apps + superadmin
- **PUBLIC**: No authentication required

## 📁 **File Upload Validations**

### **Single File Upload (`POST /upload`)**

**File Requirements:**
- ✅ **File must be provided** (`file` field required)
- ✅ **File buffer must exist** (not empty)

**File Size Limits:**
- **Dashboard**: `50MB` maximum
- **Academy**: `10MB` maximum  
- **Support**: `10MB` maximum

**File Count Limits:**
- **Dashboard**: `50 files` maximum (default)
- **Academy**: `5 files` maximum
- **Support**: `5 files` maximum

**Allowed File Types by Context:**

#### **Dashboard (Admin) - All Types Allowed:**
- ✅ **All file types** (`*` wildcard)
- ✅ **SVG files** (superadmin only)
- ❌ **Globally denied types** (see below)

#### **Academy - Restricted:**
- ✅ Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- ✅ Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- ❌ **No SVG** (security)

#### **Support - Restricted:**
- ✅ Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- ✅ Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- ❌ **No SVG** (security)

### **Globally Denied Types (All Users):**
```typescript
❌ 'text/html'
❌ 'application/javascript' 
❌ 'text/javascript'
❌ 'application/x-msdownload'
❌ 'application/java-archive'
❌ 'application/x-sh'
❌ 'application/x-dosexec'
❌ 'application/wasm'
❌ 'application/x-php'
❌ 'application/zip'
❌ 'application/x-rar-compressed'
❌ 'application/x-7z-compressed'
❌ 'application/gzip'
❌ 'application/x-tar'
❌ 'application/x-apple-diskimage'
```

### **MIME Type Validation:**
- ✅ **MIME type must match file extension**
- ✅ **No executable files**
- ✅ **No script files**
- ✅ **No archive files**

## 📝 **DTO Validations**

### **UploadMediaDto:**
```typescript
accessLevel?: AccessLevel = AccessLevel.SELF
  // ✅ Must be: 'self' | 'support' | 'academy' | 'public'

collectionName?: CollectionType = CollectionType.DEFAULT  
  // ✅ Must be: 'avatar' | 'cover' | 'gallery' | 'attachments' | 'documents' | 'default'

modelType?: string
  // ✅ Optional string

modelId?: string  
  // ✅ Optional UUID format

altText?: string
  // ✅ Optional string

title?: string
  // ✅ Optional string

description?: string
  // ✅ Optional string

directory?: string = 'shared'
  // ✅ Optional string, defaults to 'shared'
```

### **UploadManyMediaDto:**
```typescript
accessLevel?: AccessLevel = AccessLevel.SELF
  // ✅ Same as above

collectionName?: CollectionType = CollectionType.GALLERY
  // ✅ Defaults to 'gallery' for multiple files

maxFiles?: number = 5
  // ✅ Integer, min: 1, max: 50

// ... other fields same as UploadMediaDto
```

### **QueryMediaDto:**
```typescript
accessLevel?: AccessLevel
  // ✅ Optional enum

collectionName?: CollectionType  
  // ✅ Optional enum

modelType?: string
  // ✅ Optional string

modelId?: string
  // ✅ Optional UUID

mimeType?: string
  // ✅ Optional string

sort_by?: string = 'createdAt'
  // ✅ Must be: 'createdAt' | 'updatedAt' | 'filename' | 'size'
```

### **UpdateMediaDto:**
```typescript
altText?: string
  // ✅ Optional string

title?: string  
  // ✅ Optional string

description?: string
  // ✅ Optional string

accessLevel?: AccessLevel
  // ✅ Optional enum
```

### **AttachMediaDto:**
```typescript
mediaId: string
  // ✅ Required UUID

modelType: string
  // ✅ Required string

modelId: string  
  // ✅ Required UUID

collectionName?: CollectionType = CollectionType.DEFAULT
  // ✅ Optional enum

sortOrder?: number = 0
  // ✅ Optional integer, min: 0
```

## 🚨 **Error Messages**

### **File Validation Errors:**
- `"No file provided"` - Missing file
- `"File size (XMB) exceeds maximum allowed size (YMB) for dashboard context"` - Size limit
- `"File type 'image/svg+xml' is not allowed for security reasons"` - Denied type
- `"File type 'application/zip' is not allowed for security reasons"` - Globally denied
- `"SVG files can only be uploaded by super administrators"` - SVG restriction
- `"Maximum 50 files allowed for dashboard uploads"` - File count limit

### **DTO Validation Errors:**
- `"accessLevel must be a valid enum value"` - Invalid access level
- `"modelId must be a UUID"` - Invalid UUID format
- `"maxFiles must not be less than 1"` - Invalid file count
- `"sort_by must be one of: createdAt, updatedAt, filename, size"` - Invalid sort field

## 🔧 **Security Features**

### **File Security:**
- ✅ **Virus scanning** (if enabled)
- ✅ **MIME type validation**
- ✅ **Extension matching**
- ✅ **Executable file blocking**
- ✅ **Script file blocking**

### **Access Control:**
- ✅ **JWT authentication required**
- ✅ **Admin permissions checked**
- ✅ **App-level permissions** (support/academy)
- ✅ **Super admin overrides**

### **Storage Security:**
- ✅ **Organized directory structure**
- ✅ **Unique filename generation**
- ✅ **Temporary file cleanup**
- ✅ **Access level enforcement**






----------------------------------


i need to build a component similar to FormItemInput but its for media uploader also a media manager

i need a reusable component folder where it will have all sub components like this

-- components
---- Media
------ Manager (has index.vue)
------ Uploader (has Index.vue)


please check the media uploader with manager code i made for an old project as an idea of what i want to do


please respect my backend API docs i mentioned in same file for my media also scan my composable if u needed to use any of those files also consider translation ready for my en.json and de.json

i need the uploader follow validations as mentioned on the md file as well.

i need to seperate the idea into uploader and maybe smaller sub components as well also manager and also may be into some small compnents as well if needed 


must use SOLID concept, Reusablity and Best Practice code 

i also have tailwind css and shadcn liberary installed and used across my project if need need any to build it



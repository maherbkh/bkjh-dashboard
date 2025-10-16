import type {
    MediaEntity,
    MediaQueryDto,
    UploadMediaDto,
    UpdateMediaDto,
    UploadResponse,
    BulkUploadResponse,
    ApiResponse,
    MediaStatsResponse,
} from '~/types/media/index';
import { UploadError, MediaErrorCode } from '~/types/media/index';
import { toast } from 'vue-sonner';

/**
 * Media repository composable
 * Centralizes all API calls for media operations
 */
export function useMediaRepository() {
    /**
   * Find all media with query parameters
   */
    async function findAll(query: MediaQueryDto): Promise<ApiResponse<MediaEntity[]>> {
        try {
            console.log('🌐 [useMediaRepository] Fetching media with query:', query);
            console.log('🌐 [useMediaRepository] API endpoint: /shared/media');
            const { data, error } = await useApiFetch('/shared/media', {
                method: 'GET',
                query: query as Record<string, any>,
            });

            console.log('🌐 [useMediaRepository] useApiFetch result - data:', data.value, 'error:', error.value);

            if (error.value) {
                console.error('❌ [useMediaRepository] API error:', error.value);
                console.error('❌ [useMediaRepository] Error details:', JSON.stringify(error.value, null, 2));
                throw new UploadError(
                    error.value.message || 'Failed to fetch media',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }

            console.log('✅ [useMediaRepository] API response received:', data.value);

            // Handle your backend's response structure: { success, message, data: { data: [...], meta: {...} } }
            const backendResponse = data.value as {
                success: boolean;
                message: string;
                data: {
                    data: MediaEntity[];
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
                };
            };

            // Transform to expected ApiResponse format
            const result: ApiResponse<MediaEntity[]> = {
                data: backendResponse.data.data,
                meta: {
                    page: backendResponse.data.meta.page,
                    limit: backendResponse.data.meta.limit,
                    total: backendResponse.data.meta.total,
                    totalPages: backendResponse.data.meta.totalPages,
                    hasNextPage: backendResponse.data.meta.hasNextPage,
                    hasPrevPage: backendResponse.data.meta.hasPrevPage,
                    nextPage: backendResponse.data.meta.nextPage,
                    prevPage: backendResponse.data.meta.prevPage,
                },
            };

            console.log('📊 [useMediaRepository] Transformed response:', result);

            // Show info toast for empty results
            if (result.data.length === 0) {
                toast.info('No media found', {
                    description: 'Try adjusting your search criteria',
                });
            }

            return result;
        }
        catch (err) {
            console.error('❌ [useMediaRepository] FindAll error:', err);
            if (err instanceof UploadError) throw err;
            throw new UploadError('Failed to fetch media', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Find media by ID
   */
    async function findById(id: string): Promise<MediaEntity> {
        try {
            const { data, error } = await useApiFetch(`/shared/media/${id}`, {
                method: 'GET',
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Failed to fetch media',
                    { code: MediaErrorCode.NOT_FOUND, details: error.value },
                );
            }

            // Handle backend response structure for single media
            const backendResponse = data.value as { success: boolean; message: string; data: MediaEntity };
            return backendResponse.data;
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Failed to fetch media', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Create single media file
   */
    async function create(file: File, dto: Partial<UploadMediaDto>): Promise<MediaEntity> {
        console.log('🌐 [useMediaRepository] Starting create function:', {
            file: { name: file.name, size: file.size, type: file.type },
            dto,
        });

        try {
            console.log('📦 [useMediaRepository] Step 1: Creating FormData...');
            const formData = new FormData();
            formData.append('file', file);

            // Add context only if provided (no default value)
            if (dto.context !== undefined && dto.context !== null) {
                formData.append('context', dto.context);
                console.log('📦 [useMediaRepository] Added context to FormData:', dto.context);
            }
            else {
                console.log('📦 [useMediaRepository] Context not provided - not adding to FormData');
            }

            // Add DTO properties (exclude authType as it's determined by backend)
            console.log('📦 [useMediaRepository] Step 2: Adding DTO properties to FormData...');
            Object.entries(dto).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && key !== 'authType') {
                    formData.append(key, value.toString());
                    console.log(`📦 [useMediaRepository] Added ${key}: ${value}`);
                }
                else {
                    console.log(`📦 [useMediaRepository] Skipped ${key}: ${value} (empty or undefined)`);
                }
            });

            console.log('🌐 [useMediaRepository] Step 3: Making API call to /shared/media/upload...');
            console.log('🌐 [useMediaRepository] API call details:', {
                url: '/shared/media/upload',
                method: 'POST',
                formDataEntries: Array.from(formData.entries()),
            });

            const { data, error } = await useApiFetch('/shared/media/upload', {
                method: 'POST',
                body: formData,
            });

            console.log('🌐 [useMediaRepository] API call completed:', {
                data: data.value,
                error: error.value,
            });

            if (error.value) {
                console.error('❌ [useMediaRepository] API call failed:', error.value);
                throw new UploadError(
                    error.value.message || 'Upload failed',
                    { code: MediaErrorCode.UPLOAD_ERROR, details: error.value },
                );
            }

            const response = data.value as { success: boolean; message: string; data: UploadResponse };
            const uploadResult = response.data;
            console.log('✅ [useMediaRepository] API call successful:', uploadResult);

            // Convert UploadResponse to MediaEntity
            const result: MediaEntity = {
                id: uploadResult.id,
                uuid: uploadResult.uuid,
                filename: uploadResult.filename,
                storedName: uploadResult.filename, // Use filename as storedName if not provided
                path: uploadResult.url, // Use url as path
                url: uploadResult.url, // Add url field for getImageSrc compatibility
                mimeType: uploadResult.mimeType,
                extension: uploadResult.filename.split('.').pop() || '',
                size: uploadResult.size,
                width: uploadResult.width,
                height: uploadResult.height,
                metadata: {},
                accessLevel: uploadResult.accessLevel,
                authId: uploadResult.authId,
                authType: uploadResult.authType,
                directory: uploadResult.directory,
                createdAt: uploadResult.createdAt,
                updatedAt: uploadResult.createdAt, // Use createdAt as updatedAt if not provided
            };

            // Show success toast
            toast.success('File uploaded successfully', {
                description: result.filename,
            });

            console.log('🎉 [useMediaRepository] Create function completed successfully');
            return result;
        }
        catch (err) {
            console.error('❌ [useMediaRepository] Create function failed:', err);
            if (err instanceof UploadError) throw err;
            throw new UploadError('Upload failed', { code: MediaErrorCode.UPLOAD_ERROR, details: err });
        }
    }

    /**
   * Create multiple media files
   */
    async function createMany(files: File[], dto: Partial<UploadMediaDto>): Promise<BulkUploadResponse> {
        console.log('🌐 [useMediaRepository] Starting createMany function:', {
            fileCount: files.length,
            files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
            dto,
        });

        try {
            console.log('📦 [useMediaRepository] Step 1: Creating FormData for multiple files...');
            const formData = new FormData();

            // Append all files
            files.forEach((file, index) => {
                formData.append('files', file);
                console.log(`📦 [useMediaRepository] Added file ${index + 1}: ${file.name}`);
            });

            // Add context only if provided (no default value)
            if (dto.context !== undefined && dto.context !== null) {
                formData.append('context', dto.context);
                console.log('📦 [useMediaRepository] Added context to FormData:', dto.context);
            }
            else {
                console.log('📦 [useMediaRepository] Context not provided - not adding to FormData');
            }

            // Add DTO properties (exclude authType as it's determined by backend)
            console.log('📦 [useMediaRepository] Step 2: Adding DTO properties to FormData...');
            Object.entries(dto).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && key !== 'authType') {
                    formData.append(key, value.toString());
                    console.log(`📦 [useMediaRepository] Added ${key}: ${value}`);
                }
                else {
                    console.log(`📦 [useMediaRepository] Skipped ${key}: ${value} (empty or undefined)`);
                }
            });

            console.log('🌐 [useMediaRepository] Step 3: Making API call to /shared/media/upload-many...');
            console.log('🌐 [useMediaRepository] API call details:', {
                url: '/shared/media/upload-many',
                method: 'POST',
                formDataEntries: Array.from(formData.entries()),
            });

            const { data, error } = await useApiFetch('/shared/media/upload-many', {
                method: 'POST',
                body: formData,
            });

            console.log('🌐 [useMediaRepository] API call completed:', {
                data: data.value,
                error: error.value,
            });

            if (error.value) {
                console.error('❌ [useMediaRepository] API call failed:', error.value);
                throw new UploadError(
                    error.value.message || 'Bulk upload failed',
                    { code: MediaErrorCode.UPLOAD_ERROR, details: error.value },
                );
            }

            const response = data.value as { success: boolean; message: string; data: BulkUploadResponse };
            const bulkResult = response.data;
            console.log('✅ [useMediaRepository] API call successful:', bulkResult);

            // Convert successful UploadResponse[] to MediaEntity[]
            const successfulMedia: MediaEntity[] = bulkResult.successful.map(uploadResult => ({
                id: uploadResult.id,
                uuid: uploadResult.uuid,
                filename: uploadResult.filename,
                storedName: uploadResult.filename,
                path: uploadResult.url,
                url: uploadResult.url, // Add url field for getImageSrc compatibility
                mimeType: uploadResult.mimeType,
                extension: uploadResult.filename.split('.').pop() || '',
                size: uploadResult.size,
                width: uploadResult.width,
                height: uploadResult.height,
                metadata: {},
                accessLevel: uploadResult.accessLevel,
                authId: uploadResult.authId,
                authType: uploadResult.authType,
                directory: uploadResult.directory,
                createdAt: uploadResult.createdAt,
                updatedAt: uploadResult.createdAt,
            }));

            // Convert MediaEntity[] to UploadResponse[] for BulkUploadResponse
            const uploadResponses: UploadResponse[] = successfulMedia.map(media => ({
                id: media.id,
                uuid: media.uuid,
                filename: media.filename,
                mimeType: media.mimeType,
                size: media.size,
                width: media.width,
                height: media.height,
                url: media.url || '', // Ensure url is not undefined
                accessLevel: media.accessLevel,
                authId: media.authId,
                authType: media.authType,
                directory: media.directory,
                createdAt: media.createdAt,
            }));

            const result: BulkUploadResponse = {
                ...bulkResult,
                successful: uploadResponses,
            };

            // Show success toast with summary
            toast.success('Files uploaded successfully', {
                description: `${result.successCount} of ${result.totalCount} files uploaded`,
            });

            console.log('🎉 [useMediaRepository] CreateMany function completed successfully');
            return result;
        }
        catch (err) {
            console.error('❌ [useMediaRepository] CreateMany function failed:', err);
            if (err instanceof UploadError) throw err;
            throw new UploadError('Bulk upload failed', { code: MediaErrorCode.UPLOAD_ERROR, details: err });
        }
    }

    /**
   * Update media metadata
   */
    async function update(id: string, dto: UpdateMediaDto): Promise<MediaEntity> {
        try {
            const { data, error } = await useApiFetch(`/shared/media/${id}`, {
                method: 'PATCH',
                body: dto,
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Update failed',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }

            // Handle backend response structure for update
            const backendResponse = data.value as { success: boolean; message: string; data: MediaEntity };
            const result = backendResponse.data;

            // Show success toast
            toast.success('Media updated successfully', {
                description: result.filename,
            });

            return result;
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Update failed', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Delete single media
   */
    async function deleteMedia(id: string): Promise<void> {
        try {
            const { error } = await useApiFetch(`/shared/media/${id}`, {
                method: 'DELETE',
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Delete failed',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }

            // Show success toast
            toast.success('Media deleted successfully');
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Delete failed', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Delete multiple media files
   */
    async function deleteMany(ids: string[]): Promise<void> {
        try {
            await Promise.all(ids.map(id => deleteMedia(id)));
        }
        catch (err) {
            throw new UploadError('Bulk delete failed', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Get media statistics
   */
    async function getStats(): Promise<MediaStatsResponse> {
        try {
            const { data, error } = await useApiFetch('/shared/media/stats', {
                method: 'GET',
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Failed to fetch stats',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }

            // Handle backend response structure for stats
            const backendResponse = data.value as { success: boolean; message: string; data: MediaStatsResponse };
            return backendResponse.data;
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Failed to fetch stats', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Attach media to model
   */
    async function attachToModel(mediaId: string, modelType: string, modelId: string, collectionName: string, sortOrder: number = 0): Promise<void> {
        try {
            const { error } = await useApiFetch(`/shared/media/${mediaId}/attach`, {
                method: 'POST',
                body: {
                    modelType,
                    modelId,
                    collectionName,
                    sortOrder,
                },
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Failed to attach media',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Failed to attach media', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Detach media from model
   */
    async function detachFromModel(mediaId: string, modelType: string, modelId: string, collectionName: string): Promise<void> {
        try {
            const { error } = await useApiFetch(`/shared/media/${mediaId}/detach`, {
                method: 'DELETE',
                query: {
                    modelType,
                    modelId,
                    collectionName,
                },
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Failed to detach media',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Failed to detach media', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    /**
   * Get model media collection
   */
    async function getModelMedia(modelType: string, modelId: string, collectionName?: string): Promise<MediaEntity[]> {
        try {
            const endpoint = collectionName
                ? `/shared/media/model/${modelType}/${modelId}/${collectionName}`
                : `/shared/media/model/${modelType}/${modelId}`;

            const { data, error } = await useApiFetch(endpoint, {
                method: 'GET',
            });

            if (error.value) {
                throw new UploadError(
                    error.value.message || 'Failed to fetch model media',
                    { code: MediaErrorCode.NETWORK_ERROR, details: error.value },
                );
            }

            // Handle backend response structure for model media
            const backendResponse = data.value as { success: boolean; message: string; data: MediaEntity[] };
            return backendResponse.data;
        }
        catch (err) {
            if (err instanceof UploadError) throw err;
            throw new UploadError('Failed to fetch model media', { code: MediaErrorCode.NETWORK_ERROR, details: err });
        }
    }

    return {
        findAll,
        findById,
        create,
        createMany,
        update,
        deleteMedia,
        deleteMany,
        getStats,
        attachToModel,
        detachFromModel,
        getModelMedia,
    };
}

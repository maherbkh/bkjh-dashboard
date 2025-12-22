import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { ZodSchema } from 'zod';
import { toast } from 'vue-sonner';
import type { CrudItem, PaginatedResponse, Category } from '~/types';

type CrudOptions = {
    crudPath: string;
    tenant: 'shared' | 'academy' | 'support';
    translations?: {
        add_success?: string;
        edit_success?: string;
        delete_success?: string;
        error?: string;
    };
    formSchema?: ZodSchema;
};

export const useCrud = <T extends CrudItem, FormType = Record<string, any>>(options: CrudOptions) => {
    const { t } = useI18n();
    const { crudPath, tenant, translations, formSchema } = options;

    // Build API path with tenant and crud path
    const buildApiPath = (endpoint: string = '') => {
        return `/${tenant}/${crudPath}${endpoint}`;
    };

    // VeeValidate form
    const { handleSubmit, defineField, errors, resetForm, setValues } = useForm({
        validationSchema: formSchema ? toTypedSchema(formSchema) : undefined,
    });

    // State management
    const items = ref<T[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const pagination = ref({
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0,
    });

    // Default translations
    const defaultTranslations = {
        add_success: translations?.add_success || t('global.messages.success'),
        edit_success: translations?.edit_success || t('global.messages.success'),
        delete_success: translations?.delete_success || t('global.messages.success'),
        error: translations?.error || t('global.messages.error'),
    };

    /**
   * Fetch all items with optional pagination
   */
    const fetchItems = async (page = 1, perPage = 25, additionalParams: Record<string, any> = {}, forceRefresh?: number) => {
        loading.value = true;
        error.value = null;

        try {
            const params = {
                page,
                length: perPage,
                ...additionalParams,
            };

            // ALWAYS include timestamp to ensure every call is unique
            // This prevents any caching, even for identical URLs and parameters
            const timestamp = forceRefresh || Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const cacheKey = `${tenant}-${crudPath}-list-${page}-${perPage}-${JSON.stringify(additionalParams)}-${timestamp}-${random}`;

            const { data, status } = await useApiFetch(buildApiPath(), {
                query: params,
                key: cacheKey,
            });

            if (status.value === 'success' && data.value) {
                const responseData = (data.value as any).data;
                items.value = responseData.data;
                pagination.value = {
                    currentPage: responseData.meta.currentPage,
                    lastPage: responseData.meta.lastPage,
                    perPage: responseData.meta.perPage,
                    total: responseData.meta.total,
                };
            }

            return { data: data.value, status: status.value };
        }
        catch (err) {
            // Check if it's a 401 error
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
                // 401 errors are handled by useApiFetch, so we don't need to do anything here
                throw err;
            }

            error.value = err instanceof Error ? err.message : t('global.messages.something_went_wrong');
            toast.error(defaultTranslations.error);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };

    /**
   * Fetch a single item by ID
   */
    const fetchItem = async (id: string | number) => {
        loading.value = true;
        error.value = null;

        try {
            // Always include timestamp and random to prevent caching
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const { data, status } = await useApiFetch(buildApiPath(`/${id}`), {
                key: `${tenant}-${crudPath}-item-${id}-${timestamp}-${random}`,
            });

            if (status.value === 'success' && data.value) {
                const responseData = (data.value as any).data;
                return { data: responseData, status: status.value };
            }

            return { data: data.value, status: status.value };
        }
        catch (err) {
            // Check if it's a 401 error
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
                // 401 errors are handled by useApiFetch, so we don't need to do anything here
                throw err;
            }

            error.value = err instanceof Error ? err.message : t('global.messages.something_went_wrong');
            toast.error(defaultTranslations.error);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };

    /**
   * Create a new item
   */
    const createItem = async (itemData: FormType) => {
        loading.value = true;
        error.value = null;

        try {
            const { data, status, error: fetchError } = await useApiFetch(buildApiPath(), {
                method: 'POST',
                body: itemData as any,
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.add_success);
                // Don't auto-refresh - let caller handle refresh with correct params
                // await refresh();
                return { data: data.value, status: status.value };
            }
            else if (fetchError.value) {
                // Handle validation errors or other backend errors
                const errorMessage = fetchError.value.data?.message || fetchError.value.message || t('global.messages.something_went_wrong');
                error.value = errorMessage;
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
        }
        catch (err) {
            // Check if it's a 401 error
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
                // 401 errors are handled by useApiFetch, so we don't need to do anything here
                throw err;
            }

            if (err instanceof Error && err.message !== t('global.messages.something_went_wrong')) {
                // Re-throw if it's already a handled error
                throw err;
            }
            error.value = err instanceof Error ? err.message : t('global.messages.something_went_wrong');
            toast.error(defaultTranslations.error);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };

    /**
   * Update an existing item
   */
    const updateItem = async (id: string | number, itemData: FormType) => {
        loading.value = true;
        error.value = null;

        try {
            const { data, status, error: fetchError } = await useApiFetch(buildApiPath(`/${id}`), {
                method: 'PATCH',
                body: itemData as any,
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.edit_success);
                // Don't auto-refresh - let caller handle refresh with correct params
                // await refresh();
                return { data: data.value, status: status.value };
            }
            else if (fetchError.value) {
                // Handle validation errors or other backend errors
                const errorMessage = fetchError.value.data?.message || fetchError.value.message || t('global.messages.something_went_wrong');
                error.value = errorMessage;
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
        }
        catch (err) {
            // Check if it's a 401 error
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
                // 401 errors are handled by useApiFetch, so we don't need to do anything here
                throw err;
            }

            if (err instanceof Error && err.message !== t('global.messages.something_went_wrong')) {
                // Re-throw if it's already a handled error
                throw err;
            }
            error.value = err instanceof Error ? err.message : t('global.messages.something_went_wrong');
            toast.error(defaultTranslations.error);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };

    /**
   * Delete an item
   */
    const deleteItem = async (id: string | number) => {
        loading.value = true;
        error.value = null;

        try {
            const { data, status } = await useApiFetch(buildApiPath(`/${id}`), {
                method: 'DELETE',
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.delete_success);
                await refresh();
                return { data: data.value, status: status.value };
            }
        }
        catch (err) {
            // Check if it's a 401 error
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
                // 401 errors are handled by useApiFetch, so we don't need to do anything here
                throw err;
            }

            error.value = err instanceof Error ? err.message : t('global.messages.something_went_wrong');
            toast.error(defaultTranslations.error);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };

    /**
   * Delete multiple items
   */
    const deleteManyItems = async (ids: (string | number)[]) => {
        loading.value = true;
        error.value = null;

        try {
            const { data, status, error: fetchError } = await useApiFetch(buildApiPath('/delete-many'), {
                method: 'POST',
                body: { ids },
            });

            if (status.value === 'success') {
                const responseData = (data.value as any).data;
                const deletedCount = responseData.deletedCount;
                const notFoundIds = responseData.notFoundIds || [];

                // Show appropriate success message based on results
                if (notFoundIds.length === 0) {
                    // All items deleted successfully
                    toast.success(t('global.messages.bulk_delete_success', { count: deletedCount }) || `Successfully deleted ${deletedCount} items`);
                }
                else {
                    // Some items not found
                    const message = t('global.messages.bulk_delete_partial', {
                        deleted: deletedCount,
                        notFound: notFoundIds.length,
                    }) || `Deleted ${deletedCount} items. ${notFoundIds.length} items not found.`;
                    toast.warning(message);
                }

                await refresh();
                return { data: data.value, status: status.value };
            }
            else if (fetchError.value) {
                // Handle validation errors or other backend errors
                const errorMessage = fetchError.value.data?.message || fetchError.value.message || t('global.messages.something_went_wrong');
                error.value = errorMessage;
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
        }
        catch (err) {
            // Check if it's a 401 error
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
                // 401 errors are handled by useApiFetch, so we don't need to do anything here
                throw err;
            }

            if (err instanceof Error && err.message !== t('global.messages.something_went_wrong')) {
                // Re-throw if it's already a handled error
                throw err;
            }
            error.value = err instanceof Error ? err.message : t('global.messages.something_went_wrong');
            toast.error(defaultTranslations.error);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };

    const refresh = async () => {
        // Force refresh by adding timestamp to cache key
        const timestamp = Date.now();
        await fetchItems(pagination.value.currentPage, pagination.value.perPage, {}, timestamp);
    };

    const reset = () => {
        items.value = [];
        error.value = null;
        pagination.value = {
            currentPage: 1,
            lastPage: 1,
            perPage: 25,
            total: 0,
        };
    };

    return {
        items,
        loading,
        error,
        pagination,
        fetchItems,
        fetchItem,
        createItem: createItem as (itemData: FormType) => Promise<{ data: any; status: string }>,
        updateItem: updateItem as (id: string | number, itemData: FormType) => Promise<{ data: any; status: string }>,
        deleteItem: deleteItem as (id: string | number) => Promise<{ data: any; status: string }>,
        deleteManyItems: deleteManyItems as (ids: (string | number)[]) => Promise<{ data: any; status: string }>,
        refresh,
        handleSubmit,
        defineField,
        errors,
        resetForm,
        setValues,
    };
};

// Category type is now imported from ~/types

// Convenience function for categories
export function useCategoryCrud(tenant: 'shared' | 'academy' | 'support' = 'shared') {
    const { t } = useI18n();

    return useCrud<Category>({
        crudPath: 'category',
        tenant,
        translations: {
            add_success: t('action.message.add_successfully', { model: t('category.singular') }),
            edit_success: t('action.message.edit_successfully', { model: t('category.singular') }),
            delete_success: t('action.message.delete_successfully', { model: t('category.singular') }),
            error: t('global.error'),
        },
    });
}

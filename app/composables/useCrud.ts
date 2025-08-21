import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { ZodSchema } from 'zod';
import { toast } from 'vue-sonner';
import type { CrudItem, PaginatedResponse, Category } from '~/types';

type CrudOptions = {
    apiSlug: string;
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
    const { apiSlug, translations, formSchema } = options;

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
    const fetchItems = async (page = 1, perPage = 25, additionalParams: Record<string, any> = {}) => {
        loading.value = true;
        error.value = null;

        try {
            const params = {
                page,
                length: perPage,
                ...additionalParams,
            };

            const { data, status } = await useApiFetch<PaginatedResponse<T>>(`/api/${apiSlug}`, {
                query: params,
                key: `${apiSlug}-list-${page}-${perPage}-${JSON.stringify(additionalParams)}`,
            });

            if (status.value === 'success' && data.value) {
                items.value = data.value.data.data;
                pagination.value = {
                    currentPage: data.value.data.meta.currentPage,
                    lastPage: data.value.data.meta.lastPage,
                    perPage: data.value.data.meta.perPage,
                    total: data.value.data.meta.total,
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
            const { data, status } = await useApiFetch<T>(`/api/${apiSlug}/${id}`, {
                key: `${apiSlug}-item-${id}`,
            });

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
            const { status, error: fetchError } = await useApiFetch<T>(`/api/${apiSlug}`, {
                method: 'POST',
                body: itemData as any,
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.add_success);
                await refresh();
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
            const { status, error: fetchError } = await useApiFetch(`/api/${apiSlug}/${id}`, {
                method: 'PUT',
                body: itemData as any,
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.edit_success);
                await refresh();
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
    /**
   * Delete an item
   */
    const deleteItem = async (id: string | number) => {
        loading.value = true;
        error.value = null;

        try {
            const { status } = await useApiFetch(`/api/${apiSlug}/${id}`, {
                method: 'DELETE',
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.delete_success);
                await refresh();
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
            const { status } = await useApiFetch(`/api/${apiSlug}`, {
                method: 'DELETE',
                body: { ids },
            });

            if (status.value === 'success') {
                toast.success(defaultTranslations.delete_success);
                await refresh();
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

    const refresh = async () => {
        await fetchItems(pagination.value.currentPage, pagination.value.perPage);
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
        createItem: createItem as (itemData: FormType) => Promise<void>,
        updateItem: updateItem as (id: string | number, itemData: FormType) => Promise<void>,
        deleteItem,
        deleteManyItems,
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
export function useCategoryCrud() {
    const { t } = useI18n();

    return useCrud<Category>({
        apiSlug: 'category',
        translations: {
            add_success: t('categories.add_success'),
            edit_success: t('categories.edit_success'),
            delete_success: t('categories.delete_success'),
            error: t('global.error'),
        },
    });
}

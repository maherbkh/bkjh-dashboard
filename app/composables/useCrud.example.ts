import type { Address, CrudItem, User } from '~/types';

// Example 1: Using the generic useCrud for companies
export type Company = CrudItem & {
    id: string;
    name: string;
    location: string;
    register: string;
    partner: {
        name: string;
        location: string;
        register: string;
    };
    management: string;
    addressId: string | null;
    position: number;
    createdAt: string;
    updatedAt: string;
    address: Address | null;
    groups: any[];
};

export function useCompanyCrud() {
    const { t } = useI18n();

    return useCrud<Company>({
        crudPath: 'companies',
        tenant: 'shared',
        translations: {
            add_success: t('action.message.add_successfully', { model: t('company.singular') }),
            edit_success: t('action.message.edit_successfully', { model: t('company.singular') }),
            delete_success: t('action.message.delete_successfully', { model: t('company.singular') }),
            error: t('global.error'),
        },
    });
}

// Example 2: Using the generic useCrud for groups
export type Group = CrudItem & {
    name: string;
    description?: string;
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
};

export function useGroupCrud() {
    const { t } = useI18n();

    return useCrud<Group>({
        apiSlug: 'groups',
        translations: {
            add_success: t('groups.add_success'),
            edit_success: t('groups.edit_success'),
            delete_success: t('groups.delete_success'),
            error: t('global.error'),
        },
    });
}

// Example 3: Using the generic useCrud for users
// User type is now available globally from types/index.d.ts

export function useUserCrud() {
    const { t } = useI18n();

    return useCrud<User>({
        apiSlug: 'users',
        translations: {
            add_success: t('users.add_success'),
            edit_success: t('users.edit_success'),
            delete_success: t('users.delete_success'),
            error: t('global.error'),
        },
    });
}

// Example usage in a Vue component:
/*
<script setup lang="ts">
import { useCompanyCrud } from '@/composables/useUserCrud'
import { useConfirmDialog } from '@/composables/useAlertDialog'

const {
  items: companies,
  loading: isLoading,
  error,
  pagination,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  handleSubmit,
  resetForm,
} = useCompanyCrud()

const { confirmDelete } = useConfirmDialog()

// Initialize data
await fetchItems()

// Create a new company
const createCompany = async (companyData) => {
  await createItem(companyData)
}

// Update a company
const updateCompany = async (id, companyData) => {
  await updateItem(id, companyData)
}

// Delete a company with AlertDialog confirmation
const deleteCompany = async (id: number) => {
  const confirmed = await confirmDelete()
  if (confirmed) {
    await deleteItem(id)
  }
}

// Search with pagination
const searchCompanies = async (searchQuery, page = 1) => {
  await fetchItems(page, 25, { search: searchQuery })
}
</script>
*/

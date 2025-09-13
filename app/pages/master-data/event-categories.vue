<script setup lang="ts">
import type { EventCategory, EventCategoryForm, TableHeaderItem, ServerParamsTypes } from "~/types";

const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t("event_category.plural"));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t("event_category.description"));
definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
});

// CRUD operations
const {
  items: eventCategories,
  loading: isLoading,
  pagination,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  deleteManyItems,
  resetForm,
  setValues,
} = useCrud<EventCategory, EventCategoryForm>({
  crudPath: "event-categories",
  tenant: "academy",
  formSchema: createEventCategorySchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref("name");
const sortDir = ref<"asc" | "desc">("asc");

// Computed properties
const status = computed(() => (isLoading.value ? "pending" : "success"));

const headerItems = computed(() => [
  {
    as: "th",
    name: t("global.name"),
    id: "name",
  },
  {
    as: "th",
    name: t("common.position"),
    id: "position",
  },
  {
    as: "th",
    name: t("common.active"),
    id: "isActive",
  },
  {
    as: "th",
    name: t("event_category.parent"),
    id: "parent",
  },
  {
    as: "th",
    name: t("common.created_at"),
    id: "created_at",
  },
]);

// Initialize data
onMounted(async () => {
  await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  });
});

// Search and pagination handlers
const handleReset = async () => {
  searchQuery.value = "";
  currentPage.value = 1;
  sortBy.value = "name";
  sortDir.value = "asc";
  await fetchItems(currentPage.value, perPage.value, {
    search: searchQuery.value,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  });
  selectedRows.value = [];
};

const handleSearchSubmit = async () => {
  currentPage.value = 1;
  await fetchItems(currentPage.value, perPage.value, {
    search: searchQuery.value,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  });
  selectedRows.value = [];
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await fetchItems(currentPage.value, perPage.value, {
    search: searchQuery.value,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  });
  selectedRows.value = [];
};

async function handleSortChange(dir: "asc" | "desc", id: string) {
  sortDir.value = dir;
  sortBy.value = id;
  currentPage.value = 1;
  await fetchItems(currentPage.value, perPage.value, {
    search: searchQuery.value,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  });
  selectedRows.value = [];
}

// Dialog state management
const isDialogOpen = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const editingEventCategory = ref<EventCategory | null>(null);
const isSubmitting = ref(false);

const openAddDialog = () => {
  dialogMode.value = "add";
  resetForm();
  editingEventCategory.value = null;
  isDialogOpen.value = true;
};

const handleEdit = async (eventCategory: EventCategory) => {
  dialogMode.value = "edit";
  editingEventCategory.value = eventCategory;
  setValues({
    name: eventCategory.name,
    position: eventCategory.position,
    isActive: eventCategory.isActive,
    parentId: eventCategory.parentId,
  });
  isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: EventCategoryForm) => {
  isSubmitting.value = true;
  try {
    if (editingEventCategory.value) {
      // Edit existing event category
      await updateItem(editingEventCategory.value.id, values);
    } else {
      // Add new event category
      await createItem(values);
    }
    selectedRows.value = [];

    // Close dialog on success
    isDialogOpen.value = false;
    editingEventCategory.value = null;
    resetForm();
  } catch (error) {
    console.error("Error submitting form:", error);
    // Keep dialog open to show errors - error handling is done in the CRUD composable
    // The dialog will remain open so users can see validation errors or try again
  } finally {
    isSubmitting.value = false;
  }
};

const onSubmitAndAddNew = async (values: EventCategoryForm) => {
  isSubmitting.value = true;
  try {
    if (editingEventCategory.value) {
      // Edit existing event category
      await updateItem(editingEventCategory.value.id, values);
      // After update, switch to add mode
      editingEventCategory.value = null;
      dialogMode.value = "add";
    } else {
      // Add new event category
      await createItem(values);
      // Force form reset by temporarily changing dialogMode to trigger watcher
      dialogMode.value = "edit";
      await nextTick();
      dialogMode.value = "add";
    }
    selectedRows.value = [];

    // Reset form but keep dialog open for adding new item
    resetForm();
  } catch (error) {
    console.error("Error submitting form:", error);
    // Keep dialog open to show errors - error handling is done in the CRUD composable
    // The dialog will remain open so users can see validation errors or try again
  } finally {
    isSubmitting.value = false;
  }
};

const handleDialogClose = () => {
  isDialogOpen.value = false;
  resetForm();
  editingEventCategory.value = null;
};

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(eventCategoryId: string) {
  const confirmed = await confirmDelete();
  if (!confirmed) return;

  try {
    await deleteItem(eventCategoryId);
    // No need to manually refresh - useCrud handles it automatically
  } catch (error) {
    console.error("Error deleting event category:", error);
  }
}

async function handleBulkDelete() {
  if (selectedRows.value.length === 0) return;

  const confirmed = await confirmBulkDelete(selectedRows.value.length);
  if (!confirmed) return;

  try {
    await deleteManyItems(selectedRows.value);
    selectedRows.value = [];
    // No need to manually refresh - useCrud handles it automatically
  } catch (error) {
    console.error("Error deleting event categories:", error);
  }
}

// Row selection handlers
const isAllSelected = computed(() => {
  return (
    eventCategories.value.length > 0 && selectedRows.value.length === eventCategories.value.length
  );
});

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedRows.value = eventCategories.value.map((eventCategory) => String(eventCategory.id));
  } else {
    selectedRows.value = [];
  }
};

const handleRowSelected = (id: string, checked: boolean) => {
  if (checked) {
    selectedRows.value.push(id);
  } else {
    selectedRows.value = selectedRows.value.filter((rowId) => rowId !== id);
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageHeaderActions
      :page-title="pageTitle"
      :page-icon="pageIcon || 'solar:bookmark-outline'"
      @add-new="openAddDialog"
    >
      <template #actions>
        <LazyButton
          v-if="selectedRows.length > 0"
          class="cursor-pointer"
          variant="destructive"
          size="sm"
          @click="handleBulkDelete"
        >
          <Icon name="solar:trash-bin-minimalistic-outline" />
          {{ $t("action.delete_all") }}
        </LazyButton>
      </template>
    </PageHeaderActions>
    <div>
      <PageSearchForm
        v-model:search-query="searchQuery"
        @search-submit="handleSearchSubmit"
        @reset-search="handleReset"
      />
    </div>
    <div>
      <div>
        <PageEmptyState
          v-if="eventCategories.length === 0"
          :search-query="searchQuery"
          :add-new-text="
            $t('action.add') + $t('common.new') + ' ' + $t('event_category.singular')
          "
        />
        <template v-else>
          <PageTable
            :header-items="headerItems as TableHeaderItem[]"
            :rows="eventCategories.map((eventCategory: EventCategory) => ({
                            ...eventCategory,
                            selected: selectedRows.includes(String(eventCategory.id)),
                        }))"
            :selected-rows="selectedRows"
            :loading="isLoading"
            :skeleton-rows="perPage"
            :selectable="true"
            :params="{
              page: currentPage,
              length: perPage,
              sortBy: sortBy,
              sortDir: sortDir,
              search: searchQuery,
            }"
            :model-value="isAllSelected"
            @toggle-sort="handleSortChange"
            @row-selected="(id: number | string, checked: boolean) => handleRowSelected(String(id), checked)"
            @update:selected-rows="
              (rows: (string | number)[]) => (selectedRows = rows.map(String))
            "
            @update:model-value="handleSelectAll"
          >
            <template #cell-name="{ row }">
              <div class="font-medium">
                {{ row.name }}
              </div>
            </template>

            <template #cell-position="{ row }">
              <Badge variant="secondary">
                {{ row.position }}
              </Badge>
            </template>

            <template #cell-isActive="{ row }">
              <Badge :variant="row.isActive ? 'success' : 'secondary'">
                {{ row.isActive ? $t("common.active") : $t("common.inactive") }}
              </Badge>
            </template>

            <template #cell-parent="{ row }">
              <div v-if="row.parent" class="text-sm">
                {{ row.parent.name }}
              </div>
              <div v-else class="text-muted-foreground text-sm">
                —
              </div>
            </template>

            <template #cell-created_at="{ row }">
              {{ useGermanDateFormat().formatDate(row.createdAt) }}
            </template>

            <template #cell-actions="{ row }">
              <div class="flex justify-end gap-2">
                <LazyButton
                  :title="$t('action.edit')"
                  variant="ghost"
                  size="icon"
                  hydrate-on-interaction="mouseover"
                  @click="handleEdit(row)"
                >
                  <Icon
                    name="solar:pen-new-square-outline"
                    class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                  />
                </LazyButton>
                <LazyButton
                  :title="$t('action.delete')"
                  variant="ghost"
                  size="icon"
                  @click="handleDelete(row.id)"
                >
                  <Icon
                    name="solar:trash-bin-trash-outline"
                    class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-destructive"
                  />
                </LazyButton>
              </div>
            </template>
          </PageTable>
          <PageTablePaginator
            class="mt-5"
            :meta="{
              currentPage: pagination.currentPage,
              lastPage: pagination.lastPage,
              perPage: pagination.perPage,
              total: pagination.total,
              from: (pagination.currentPage - 1) * pagination.perPage + 1,
              to: Math.min(pagination.currentPage * pagination.perPage, pagination.total),
            }"
            @update:page="handlePageChange"
          />
        </template>
      </div>
    </div>

    <LazyEventCategoryFormDialog
      v-model:is-dialog-open="isDialogOpen"
      v-model:dialog-mode="dialogMode"
      v-model:editing-event-category="editingEventCategory"
      :is-submitting="isSubmitting"
      @submit-and-close="onSubmitAndClose"
      @submit-and-add-new="onSubmitAndAddNew"
      @close-dialog="handleDialogClose"
    />
  </div>
</template>

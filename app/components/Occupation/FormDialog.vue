<script setup lang="ts">
import type { Occupation } from "~/types";

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
  Occupation,
  OccupationForm
>({
  crudPath: "occupations",
  tenant: "shared",
  formSchema: createOccupationSchema(t),
});

const [name, nameAttrs] = defineField("name");
const [position, positionAttrs] = defineField("position");
const [isActive, isActiveAttrs] = defineField("isActive");

const props = withDefaults(
  defineProps<{
    dialogMode?: "add" | "edit" | null;
    editingOccupation?: Occupation | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
  }>(),
  {
    dialogMode: null,
    editingOccupation: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
  }
);

const emit = defineEmits<{
  (event: "update:dialogMode", value: "add" | "edit"): void;
  (event: "update:editingOccupation", value: Occupation | null): void;
  (event: "update:isDialogOpen", value: boolean): void;
  (event: "submitAndClose" | "submitAndAddNew", values: OccupationForm): void;
  (event: "closeDialog"): void;
}>();

const dialogTitle = computed(() => {
  return props.dialogMode === "add" ? t("action.add") : t("action.edit");
});

const dialogDescription = computed(() => {
  return props.dialogMode === "add"
    ? t("action.message.add_description", { model: t("occupation.singular") })
    : t("action.message.edit_description", { model: t("occupation.singular") });
});

const isOpen = computed({
  get: () => props.isDialogOpen,
  set: (value: boolean) => emit("update:isDialogOpen", value),
});

// Watch for changes to editingOccupation and populate form
watch(
  () => props.editingOccupation,
  (occupation) => {
    if (occupation && props.dialogMode === "edit") {
      // Add a small delay to prevent focus issues
      nextTick(() => {
        setValues({
          name: occupation.name,
          position: occupation.position,
          isActive: occupation.isActive,
        });
      });
    }
  },
  { immediate: true }
);

// Watch for dialog mode changes to reset form when switching to add mode
watch(
  () => props.dialogMode,
  (newMode, oldMode) => {
    if (newMode === "add" && (oldMode === "edit" || oldMode === "add")) {
      // Reset form when switching to add mode (submitAndAddNew scenario)
      nextTick(() => {
        resetForm({
          values: {
            name: "",
            position: 0,
            isActive: true,
          },
        });
      });
    }
  }
);

// Clear form when dialog closes
watch(
  () => isOpen.value,
  (isOpen) => {
    if (!isOpen) {
      // Clear form when dialog closes to prevent focus issues
      nextTick(() => {
        resetForm({
          values: {
            name: "",
            position: 0,
            isActive: true,
          },
        });
      });
    }
  }
);

// Handle form submission with validation
const submitForm = (action: "submitAndClose" | "submitAndAddNew") => {
  handleSubmit((values) => {
    // Only emit if validation passes
    emit(action, values as OccupationForm);
  })();
};
</script>

<template>
  <FormDialog v-model:open="isOpen" :title="dialogTitle" :description="dialogDescription">
    <template #content>
      <form @submit.prevent="submitForm('submitAndClose')">
        <div class="grid grid-cols-12 gap-4 items-start">
          <FormItemInput
            id="name"
            v-model="name"
            :title="$t('global.name')"
            :placeholder="$t('global.name')"
            class="col-span-8"
            :errors="errors.name ? [errors.name] : []"
            v-bind="nameAttrs"
            required
          />
          <FormItemInput
            id="position"
            v-model="position"
            :title="$t('position.singular')"
            :placeholder="$t('position.placeholder')"
            type="number"
            class="col-span-4"
            :errors="errors.position ? [errors.position] : []"
            v-bind="positionAttrs"
            required
          />
          <FormItemSwitch
            id="isActive"
            v-model="isActive"
            :title="$t('status.singular')"
            :description="$t('status.description')"
            class="col-span-12"
            :errors="errors.isActive ? [errors.isActive] : []"
            v-bind="isActiveAttrs"
          />
        </div>
      </form>
    </template>

    <template #footer>
      <Button variant="outline" :disabled="isSubmitting" @click="emit('closeDialog')">
        {{ $t("action.cancel") }}
      </Button>
      <Button
        variant="outline"
        :disabled="isSubmitting"
        @click="submitForm('submitAndAddNew')"
      >
        <Icon
          v-if="isSubmitting"
          name="solar:refresh-linear"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{
          dialogMode === "add"
            ? $t("action.create") +
              " " +
              $t("common.and") +
              " " +
              $t("action.add") +
              " " +
              $t("common.new")
            : $t("action.update") +
              " " +
              $t("common.and") +
              " " +
              $t("action.add") +
              " " +
              $t("common.new")
        }}
      </Button>
      <Button :disabled="isSubmitting" @click="submitForm('submitAndClose')">
        <Icon
          v-if="isSubmitting"
          name="solar:refresh-linear"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{ dialogMode === "add" ? $t("action.create") : $t("action.update") }}
      </Button>
    </template>
  </FormDialog>
</template>

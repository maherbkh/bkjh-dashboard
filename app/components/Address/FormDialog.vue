<script setup lang="ts">
import type { Address } from "~/types";

const { t } = useI18n();
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
  Address,
  AddressForm
>({
  crudPath: "addresses",
  tenant: "shared",
  formSchema: createAddressSchema(t),
});

const [streetName, streetNameAttrs] = defineField("streetName");
const [buildingNumber, buildingNumberAttrs] = defineField("buildingNumber");
const [postalCode, postalCodeAttrs] = defineField("postalCode");
const [city, cityAttrs] = defineField("city");

const props = withDefaults(
  defineProps<{
    dialogMode?: "add" | "edit" | null;
    editingAddress?: Address | null;
    isSubmitting?: boolean;
    isDialogOpen?: boolean;
  }>(),
  {
    dialogMode: null,
    editingAddress: null,
    isSubmitting: () => false,
    isDialogOpen: () => false,
  }
);

const emit = defineEmits<{
  (event: "update:dialogMode", value: "add" | "edit"): void;
  (event: "update:editingAddress", value: Address | null): void;
  (event: "update:isDialogOpen", value: boolean): void;
  (event: "submitAndClose" | "submitAndAddNew", values: AddressForm): void;
  (event: "closeDialog"): void;
}>();

const dialogTitle = computed(() => {
  return props.dialogMode === "add" ? t("action.add") : t("action.edit");
});

const dialogDescription = computed(() => {
  return props.dialogMode === "add"
    ? t("action.message.add_description", { model: t("address.singular") })
    : t("action.message.edit_description", { model: t("address.singular") });
});

const isOpen = computed({
  get: () => props.isDialogOpen,
  set: (value: boolean) => emit("update:isDialogOpen", value),
});

// Watch for changes to editingAddress and populate form
watch(
  () => props.editingAddress,
  (address) => {
    if (address && props.dialogMode === "edit") {
      // Add a small delay to prevent focus issues
      nextTick(() => {
        setValues({
          streetName: address.streetName,
          buildingNumber: address.buildingNumber,
          postalCode: address.postalCode,
          city: address.city,
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
            streetName: "",
            buildingNumber: "",
            postalCode: "",
            city: "",
          },
        });
      });
    }
  }
);

// Clear form when the dialog closes
watch(
  () => isOpen.value,
  (isOpen) => {
    if (!isOpen) {
      // Clear form when the dialog closes to prevent focus issues
      nextTick(() => {
        resetForm({
          values: {
            streetName: "",
            buildingNumber: "",
            postalCode: "",
            city: "",
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
    emit(action, values as AddressForm);
  })();
};
</script>

<template>
  <FormDialog v-model:open="isOpen" :title="dialogTitle" :description="dialogDescription">
    <template #content>
      <form @submit.prevent="submitForm('submitAndClose')">
        <div class="grid grid-cols-12 gap-4 items-start">
          <FormItemInput
            id="streetName"
            v-model="streetName"
            :title="$t('street.singular')"
            :placeholder="$t('street.placeholder')"
            class="col-span-8"
            :errors="errors.streetName ? [errors.streetName] : []"
            v-bind="streetNameAttrs"
            required
          />
          <FormItemInput
            id="buildingNumber"
            v-model="buildingNumber"
            :title="$t('street_number.singular')"
            :placeholder="$t('street_number.placeholder')"
            class="col-span-4"
            :errors="errors.buildingNumber ? [errors.buildingNumber] : []"
            v-bind="buildingNumberAttrs"
            required
          />
          <FormItemInput
            id="postalCode"
            v-model="postalCode"
            :title="$t('postal_code.singular')"
            :placeholder="$t('postal_code.placeholder')"
            class="col-span-4"
            :errors="errors.postalCode ? [errors.postalCode] : []"
            v-bind="postalCodeAttrs"
            required
          />
          <FormItemInput
            id="city"
            v-model="city"
            :title="$t('city.singular')"
            :placeholder="$t('city.placeholder')"
            class="col-span-4"
            :errors="errors.city ? [errors.city] : []"
            v-bind="cityAttrs"
            required
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

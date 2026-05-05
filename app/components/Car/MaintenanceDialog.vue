<script setup lang="ts">
import { toast } from 'vue-sonner';

type CarMaintenance = {
    id: string;
    carId: string;
    startsAt: string;
    endsAt: string;
    note: string | null;
    createdAt: string;
    updatedAt: string;
};

type MaintenanceForm = {
    startsAt: string;
    endsAt: string;
    note: string;
};

type PaginatedPayload = {
    data: CarMaintenance[];
    meta: {
        currentPage: number;
        lastPage: number;
        total: number;
    };
};

type Props = {
    open: boolean;
    car: { id: string; model: string; plateNumber: string } | null;
};

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const { t } = useI18n();
const { formatDate } = useGermanDateFormat();
const { confirmDelete } = useConfirmDialog();

const records = ref<CarMaintenance[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const showForm = ref(false);
const editingRecord = ref<CarMaintenance | null>(null);

const form = ref<MaintenanceForm>({ startsAt: '', endsAt: '', note: '' });
const formErrors = ref<{ startsAt?: string; endsAt?: string }>({});

const isOpen = computed({
    get: () => props.open,
    set: val => emit('update:open', val),
});

const dialogTitle = computed(() =>
    props.car
        ? `${t('car.maintenance.dialog_title')} – ${props.car.model} (${props.car.plateNumber})`
        : t('car.maintenance.dialog_title'),
);

const isEditMode = computed(() => editingRecord.value !== null);

/** Converts an ISO date string to "yyyy-MM-dd HH:mm" format expected by FormItemDatePicker's model-type. */
function toDateTimeLocalInput(value: string | Date): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converts a datetime-local string to ISO 8601 for API submission. */
function toIso(value: string): string {
    if (!value) return '';
    return new Date(value).toISOString();
}

async function loadRecords() {
    if (!props.car) return;
    isLoading.value = true;
    try {
        const response = await fetchDashboardApi<PaginatedPayload>('/booking/car-maintenance', {
            query: {
                carId: props.car.id,
                sort_by: 'startsAt',
                sort_dir: 'desc',
                length: 100,
            },
        });
        records.value = response.data?.data ?? [];
    }
    catch {
        toast.error(t('global.messages.error'));
    }
    finally {
        isLoading.value = false;
    }
}

watch(
    () => props.open,
    (open) => {
        if (open) {
            loadRecords();
        }
        else {
            resetForm();
            records.value = [];
        }
    },
);

function resetForm() {
    form.value = { startsAt: '', endsAt: '', note: '' };
    formErrors.value = {};
    editingRecord.value = null;
    showForm.value = false;
}

function openAddForm() {
    editingRecord.value = null;
    form.value = { startsAt: '', endsAt: '', note: '' };
    formErrors.value = {};
    showForm.value = true;
}

function openEditForm(record: CarMaintenance) {
    editingRecord.value = record;
    form.value = {
        startsAt: toDateTimeLocalInput(record.startsAt),
        endsAt: toDateTimeLocalInput(record.endsAt),
        note: record.note ?? '',
    };
    formErrors.value = {};
    showForm.value = true;
}

function cancelForm() {
    resetForm();
}

function validateForm(): boolean {
    formErrors.value = {};
    if (!form.value.startsAt) {
        formErrors.value.startsAt = t('car.maintenance.errors.starts_at_required');
    }
    if (!form.value.endsAt) {
        formErrors.value.endsAt = t('car.maintenance.errors.ends_at_required');
    }
    if (form.value.startsAt && form.value.endsAt && new Date(form.value.startsAt) >= new Date(form.value.endsAt)) {
        formErrors.value.endsAt = t('car.maintenance.errors.invalid_range');
    }
    return Object.keys(formErrors.value).length === 0;
}

async function submitForm() {
    if (!validateForm() || !props.car) return;
    isSubmitting.value = true;
    try {
        const payload = {
            carId: props.car.id,
            startsAt: toIso(form.value.startsAt),
            endsAt: toIso(form.value.endsAt),
            note: form.value.note.trim() || null,
        };

        if (isEditMode.value && editingRecord.value) {
            await fetchDashboardApi(`/booking/car-maintenance/${editingRecord.value.id}`, {
                method: 'PATCH',
                body: payload,
            });
        }
        else {
            await fetchDashboardApi('/booking/car-maintenance', {
                method: 'POST',
                body: payload,
            });
        }
        toast.success(t('global.messages.success'));
        resetForm();
        await loadRecords();
    }
    catch (error: unknown) {
        const msg = (error as Record<string, unknown> & { data?: { message?: string } })?.data?.message;
        toast.error(typeof msg === 'string' ? msg : t('global.messages.error'));
    }
    finally {
        isSubmitting.value = false;
    }
}

async function handleDelete(record: CarMaintenance) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    try {
        await fetchDashboardApi(`/booking/car-maintenance/${record.id}`, {
            method: 'DELETE',
        });
        toast.success(t('global.messages.success'));
        await loadRecords();
    }
    catch {
        toast.error(t('global.messages.error'));
    }
}
</script>

<template>
    <FormDialog
        v-model:open="isOpen"
        :title="dialogTitle"
        :description="$t('car.maintenance.dialog_description')"
    >
        <template #content>
            <div class="flex flex-col gap-4">

                <!-- Add button (hidden while form is open) -->
                <div
                    v-if="!showForm"
                    class="flex justify-end"
                >
                    <Button
                        size="sm"
                        @click="openAddForm"
                    >
                        <Icon name="solar:add-circle-outline" />
                        {{ $t('car.maintenance.add') }}
                    </Button>
                </div>

                <!-- Inline add / edit form -->
                <div
                    v-if="showForm"
                    class="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-4"
                >
                    <p class="text-sm font-semibold text-foreground">
                        {{ isEditMode ? $t('car.maintenance.edit') : $t('car.maintenance.add') }}
                    </p>

                    <div class="grid grid-cols-12 gap-4">
                        <FormItemDatePicker
                            name="maintenance-starts-at"
                            :label="$t('car.maintenance.starts_at')"
                            :model-value="form.startsAt"
                            format="yyyy-MM-dd HH:mm"
                            :time-picker="true"
                            :auto-apply="true"
                            icon="solar:calendar-linear"
                            :placeholder="$t('car.maintenance.starts_at')"
                            :errors="formErrors.startsAt ? [formErrors.startsAt] : []"
                            class="col-span-12 md:col-span-6"
                            @update:model-value="form.startsAt = String($event ?? '')"
                        />
                        <FormItemDatePicker
                            name="maintenance-ends-at"
                            :label="$t('car.maintenance.ends_at')"
                            :model-value="form.endsAt"
                            format="yyyy-MM-dd HH:mm"
                            :time-picker="true"
                            :auto-apply="true"
                            icon="solar:calendar-linear"
                            :placeholder="$t('car.maintenance.ends_at')"
                            :errors="formErrors.endsAt ? [formErrors.endsAt] : []"
                            class="col-span-12 md:col-span-6"
                            @update:model-value="form.endsAt = String($event ?? '')"
                        />
                        <FormItemTextarea
                            id="maintenance-note"
                            v-model="form.note"
                            :title="$t('car.maintenance.note')"
                            :placeholder="$t('car.maintenance.note_placeholder')"
                            class="col-span-12"
                            :rows="3"
                        />
                    </div>

                    <div class="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="isSubmitting"
                            @click="cancelForm"
                        >
                            {{ $t('action.cancel') }}
                        </Button>
                        <Button
                            size="sm"
                            :disabled="isSubmitting"
                            @click="submitForm"
                        >
                            <Icon
                                v-if="isSubmitting"
                                name="solar:refresh-linear"
                                class="mr-1 h-4 w-4 animate-spin"
                            />
                            {{ isEditMode ? $t('action.update') : $t('action.save') }}
                        </Button>
                    </div>
                </div>

                <!-- Records list -->
                <div
                    v-if="isLoading"
                    class="flex items-center justify-center py-8 text-muted-foreground gap-2"
                >
                    <Icon
                        name="solar:refresh-linear"
                        class="h-5 w-5 animate-spin"
                    />
                    <span class="text-sm">{{ $t('global.loading') }}</span>
                </div>

                <div
                    v-else-if="records.length === 0"
                    class="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2"
                >
                    <Icon
                        name="solar:calendar-search-outline"
                        class="size-10 opacity-40"
                    />
                    <p class="text-sm">
                        {{ $t('car.maintenance.no_records') }}
                    </p>
                </div>

                <div
                    v-else
                    class="rounded-lg border border-border overflow-hidden"
                >
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-muted/50 border-b border-border">
                                <th class="px-4 py-2 text-left font-medium text-muted-foreground">
                                    {{ $t('car.maintenance.starts_at') }}
                                </th>
                                <th class="px-4 py-2 text-left font-medium text-muted-foreground">
                                    {{ $t('car.maintenance.ends_at') }}
                                </th>
                                <th class="px-4 py-2 text-left font-medium text-muted-foreground">
                                    {{ $t('car.maintenance.note') }}
                                </th>
                                <th class="px-4 py-2 text-right font-medium text-muted-foreground">
                                    {{ $t('action.actions') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="record in records"
                                :key="record.id"
                                class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                :class="{ 'bg-primary/5': editingRecord?.id === record.id }"
                            >
                                <td class="px-4 py-3 tabular-nums whitespace-nowrap">
                                    {{ formatDate(record.startsAt) }}
                                </td>
                                <td class="px-4 py-3 tabular-nums whitespace-nowrap">
                                    {{ formatDate(record.endsAt) }}
                                </td>
                                <td class="px-4 py-3 text-muted-foreground max-w-xs truncate">
                                    <span v-if="record.note">{{ record.note }}</span>
                                    <span
                                        v-else
                                        class="opacity-40"
                                    >—</span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex justify-end gap-1">
                                        <Button
                                            :title="$t('action.edit')"
                                            variant="ghost"
                                            size="icon"
                                            @click="openEditForm(record)"
                                        >
                                            <Icon
                                                name="solar:pen-new-square-outline"
                                                class="size-4 opacity-70 hover:opacity-100 hover:text-primary transition-all"
                                            />
                                        </Button>
                                        <Button
                                            :title="$t('action.delete')"
                                            variant="ghost"
                                            size="icon"
                                            @click="handleDelete(record)"
                                        >
                                            <Icon
                                                name="solar:trash-bin-trash-outline"
                                                class="size-4 opacity-70 hover:opacity-100 hover:text-destructive transition-all"
                                            />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>

        <template #footer>
            <Button
                variant="outline"
                @click="isOpen = false"
            >
                {{ $t('action.cancel') }}
            </Button>
        </template>
    </FormDialog>
</template>

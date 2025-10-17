<script setup lang="ts">
import type { AttendeeData, Attendee, AttendeeForm } from '~/types';
import { computed } from 'vue';

const route = useRoute();
const { t } = useI18n();

definePageMeta({
    middleware: 'auth',
});

interface AttendeeResponse {
    statusCode: number;
    message: string;
    data: AttendeeData;
}

const { data, status, refresh } = await useApiFetch<AttendeeResponse>(`/academy/attendees/${route.params.id as string}`, {
    immediate: false,
});

const attendeeData = computed<AttendeeData | undefined>(() => (data.value as any)?.data as AttendeeData | undefined);

onMounted(async () => {
    await refresh();
});

const attendeeName = computed(() => attendeeData.value?.fullName || '');

useSeoMeta({
    title: attendeeName,
    ogTitle: attendeeName,
});

// CRUD operations for editing
const {
    updateItem,
    resetForm,
} = useCrud<Attendee, AttendeeForm>({
    crudPath: 'attendees',
    tenant: 'academy',
    formSchema: createAttendeeSchema(t),
});

// Form dialog state
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('edit');
const editingAttendee = ref<Attendee | null>(null);
const isSubmitting = ref(false);

// Form handlers
const openEditDialog = () => {
    if (attendeeData.value) {
        dialogMode.value = 'edit';
        editingAttendee.value = attendeeData.value as Attendee;
        isDialogOpen.value = true;
    }
};

const onSubmitAndClose = async (values: AttendeeForm) => {
    isSubmitting.value = true;
    try {
        if (editingAttendee.value) {
            await updateItem(editingAttendee.value.id, values);
            // Refresh the attendee data after successful update
            await refresh();
        }
        isDialogOpen.value = false;
    }
    catch (error) {
        console.error('Error updating attendee:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    editingAttendee.value = null;
};
</script>

<template>
    <div class="flex flex-col gap-6">
        <Attendee
            v-if="attendeeData && status !== 'pending'"
            :attendee="attendeeData as AttendeeData"
            @edit="openEditDialog"
        />

        <LazyAttendeeFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-attendee="editingAttendee"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

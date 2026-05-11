<script setup lang="ts">
import type { AttendeeData, Attendee, AttendeeForm } from '~/types';

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
    <div class="flex flex-col gap-4">
        <!-- Loading skeleton (matches compact attendee layout) -->
        <template v-if="status === 'pending'">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex items-start gap-3">
                    <Skeleton class="size-10 shrink-0 rounded-lg sm:size-11" />
                    <div class="flex-1 space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <Skeleton class="h-5 w-40 sm:h-6 sm:w-48" />
                            <Skeleton class="h-5 w-14 rounded-full" />
                            <Skeleton class="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton class="h-3 w-full max-w-md" />
                        <Skeleton class="h-3 w-full max-w-lg" />
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Skeleton class="h-8 w-16 rounded-md" />
                    <Skeleton class="h-8 w-36 rounded-md" />
                    <Skeleton class="h-8 w-16 rounded-md" />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Skeleton
                    v-for="i in 4"
                    :key="i"
                    class="h-17 rounded-xl"
                />
            </div>
            <div class="space-y-3">
                <Skeleton class="h-9 w-full max-w-md rounded-lg" />
                <Card class="overflow-hidden">
                    <CardContent class="space-y-2 p-3">
                        <Skeleton
                            v-for="i in 5"
                            :key="i"
                            class="h-9 w-full"
                        />
                    </CardContent>
                </Card>
            </div>
        </template>

        <!-- Attendee content -->
        <Attendee
            v-else-if="attendeeData"
            :attendee="attendeeData"
            @edit="openEditDialog"
            @refresh="refresh"
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

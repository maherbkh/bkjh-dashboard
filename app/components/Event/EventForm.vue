<script setup lang="ts">
import type { EventData } from '~/types';
import { useResourcesStore } from '~/stores/resources';
import RTEditor from '~/components/FormItem/RTEditor.vue';

const { t } = useI18n();

// Props
interface Props {
    mode: 'add' | 'edit';
    initialData?: EventData | null;
    isSubmitting?: boolean;
    showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    initialData: null,
    isSubmitting: false,
    showActions: true,
});

// Emits
const emit = defineEmits<{
    submit: [values: EventForm];
    cancel: [];
}>();

// CRUD
const { defineField, errors, setValues, handleSubmit, resetForm } = useCrud<
    EventData,
    EventForm
>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// Form fields
const [title, titleAttrs] = defineField('title');
const [description, descriptionAttrs] = defineField('description');
const [shortDescription, shortDescriptionAttrs] = defineField('shortDescription');
const [note, noteAttrs] = defineField('note');
const [type, typeAttrs] = defineField('type');
const [eventCategoryId, eventCategoryIdAttrs] = defineField('eventCategoryId');
const [eventTargetId, eventTargetIdAttrs] = defineField('eventTargetId');
const [adminId, adminIdAttrs] = defineField('adminId');
const [maxCapacity, maxCapacityAttrs] = defineField('maxCapacity');
const [room, roomAttrs] = defineField('room');
const [location, locationAttrs] = defineField('location');
const [isActive, isActiveAttrs] = defineField('isActive');

// Resources for selects
const resourcesStore = useResourcesStore();
const eventCategories = computed(() => resourcesStore.eventCategories || []);
const eventTargets = computed(() => resourcesStore.eventTargets || []);

// Initialize form data when props change
watch(() => props.initialData, (newData) => {
    if (newData && props.mode === 'edit') {
        setValues({
            title: newData.title,
            description: newData.description,
            shortDescription: newData.shortDescription,
            note: newData.note || undefined,
            type: (newData.type?.toUpperCase?.() || newData.type) as any,
            eventCategoryId: (newData as any).eventCategoryId || (newData as any).categoryId || null,
            eventTargetId: (newData as any).eventTargetId || (newData as any).targetGroupId || null,
            adminId: (newData as any).adminId,
            maxCapacity: (newData as any).maxCapacity ?? (newData as any).maxTrainee ?? 1,
            room: (newData as any).conferenceRoom || newData.room || undefined,
            location: newData.location || undefined,
            isActive: newData.isActive,
        });
    }
    else if (props.mode === 'add') {
        resetForm();
    }
}, { immediate: true });

// Form submission
const onSubmit = handleSubmit((values) => {
    emit('submit', values);
});

// Cancel handler
const handleCancel = () => {
    emit('cancel');
};

// Computed properties
const submitButtonText = computed(() => {
    return props.mode === 'add' ? t('action.save') : t('action.update');
});

const formTitle = computed(() => {
    return props.mode === 'add'
        ? `${t('action.add')} ${t('event.singular')}`
        : `${t('action.edit')} ${t('event.singular')}`;
});
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>{{ formTitle }}</CardTitle>
            <CardDescription>
                {{ props.mode === 'add' ? t('event.add') : t('event.edit') }}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form
                class="space-y-6"
                @submit.prevent="onSubmit"
            >
                <div class="grid grid-cols-12 gap-4">
                    <FormItemInput
                        id="title"
                        v-model="title"
                        :title="t('event.title')"
                        :placeholder="t('event.title')"
                        class="col-span-12"
                        :errors="errors.title ? [errors.title] : []"
                        v-bind="titleAttrs"
                        required
                    />

                    <FormItemTextarea
                        id="shortDescription"
                        v-model="shortDescription"
                        :title="t('event.short_description')"
                        :placeholder="t('event.short_description')"
                        class="col-span-12"
                        :errors="errors.shortDescription ? [errors.shortDescription] : []"
                        v-bind="shortDescriptionAttrs"
                    />

                    <div class="col-span-12">
                        <label class="block text-sm font-medium mb-2">
                            {{ t('form.description') }}
                        </label>
                        <RTEditor
                            v-model="description"
                            :placeholder="t('form.description')"
                            :show-character-count="true"
                            :max-length="5000"
                            min-height="200px"
                            class="w-full"
                        />
                        <div
                            v-if="errors.description"
                            class="text-sm text-destructive mt-1"
                        >
                            {{ errors.description }}
                        </div>
                    </div>

                    <FormItemSelect
                        id="type"
                        v-model="type"
                        :title="t('event.type')"
                        :placeholder="t('action.select') + ' ' + t('event.type')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.type ? [errors.type] : []"
                        v-bind="typeAttrs"
                        :data="[
                            { id: 'ONLINE', name: 'Online' },
                            { id: 'OFFLINE', name: 'Offline' },
                            { id: 'HYBRID', name: 'Hybrid' },
                        ]"
                        key-value="id"
                        name-value="name"
                        required
                    />

                    <FormItemSelect
                        id="eventCategoryId"
                        v-model="eventCategoryId"
                        :title="t('event_category.singular')"
                        :placeholder="t('action.select') + ' ' + t('event_category.singular')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.eventCategoryId ? [errors.eventCategoryId] : []"
                        v-bind="eventCategoryIdAttrs"
                        :data="eventCategories"
                        key-value="id"
                        name-value="name"
                    />

                    <FormItemSelect
                        id="eventTargetId"
                        v-model="eventTargetId"
                        :title="t('event_target.singular')"
                        :placeholder="t('action.select') + ' ' + t('event_target.singular')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.eventTargetId ? [errors.eventTargetId] : []"
                        v-bind="eventTargetIdAttrs"
                        :data="eventTargets"
                        key-value="id"
                        name-value="name"
                    />

                    <FormItemInput
                        id="adminId"
                        v-model="adminId"
                        :title="t('user.admin')"
                        :placeholder="t('user.admin')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.adminId ? [errors.adminId] : []"
                        v-bind="adminIdAttrs"
                        required
                    />

                    <FormItemInput
                        id="maxCapacity"
                        v-model="maxCapacity"
                        :title="t('event.max_capacity')"
                        :placeholder="t('event.max_capacity')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.maxCapacity ? [errors.maxCapacity] : []"
                        v-bind="maxCapacityAttrs"
                        type="number"
                        min="1"
                        required
                    />

                    <FormItemInput
                        id="room"
                        v-model="room"
                        :title="t('event.room')"
                        :placeholder="t('event.room')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.room ? [errors.room] : []"
                        v-bind="roomAttrs"
                    />

                    <FormItemInput
                        id="location"
                        v-model="location"
                        :title="t('event.location')"
                        :placeholder="t('event.location')"
                        class="col-span-12 sm:col-span-6"
                        :errors="errors.location ? [errors.location] : []"
                        v-bind="locationAttrs"
                    />

                    <FormItemSwitch
                        id="isActive"
                        v-model="isActive"
                        :title="t('common.active')"
                        class="col-span-12"
                        v-bind="isActiveAttrs"
                    />
                </div>

                <div
                    v-if="showActions"
                    class="flex justify-end gap-2 pt-4 border-t"
                >
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="isSubmitting"
                        @click="handleCancel"
                    >
                        {{ t("action.cancel") }}
                    </Button>
                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                    >
                        <Icon
                            v-if="isSubmitting"
                            name="solar:refresh-linear"
                            class="mr-2 h-4 w-4 animate-spin"
                        />
                        {{ submitButtonText }}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
</template>

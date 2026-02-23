<template>
    <Dialog
        :open="isDialogOpen"
        @update:open="(value) => emit('update:isDialogOpen', value)"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                    {{ dialogMode === "add" ? $t("action.add") : $t("action.edit") }}
                    {{ $t("event_target.singular") }}
                </DialogTitle>
                <DialogDescription>
                    {{
                        dialogMode === "add"
                            ? $t("action.add_description", { model: $t("event_target.singular") })
                            : $t("action.edit_description", { model: $t("event_target.singular") })
                    }}
                </DialogDescription>
            </DialogHeader>

            <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pr-5 scroll-app">
                <form
                    class="space-y-4"
                    @submit.prevent="handleSubmit"
                >
                    <div class="space-y-2">
                        <Label for="code">{{ $t("event_target.code") }}</Label>
                        <FormItemInput
                            id="code"
                            v-model="code"
                            :placeholder="$t('event_target.code_placeholder')"
                            :error="errors.code"
                            required
                            maxlength="10"
                        />
                        <p class="text-xs text-muted-foreground">
                            {{ $t("event_target.code_help") }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="name">{{ $t("global.name") }}</Label>
                        <FormItemInput
                            id="name"
                            v-model="name"
                            :placeholder="$t('event_target.name_placeholder')"
                            :error="errors.name"
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="slug">{{ $t("event_target.slug") }}</Label>
                        <FormItemInput
                            id="slug"
                            v-model="slug"
                            :placeholder="$t('event_target.slug_placeholder')"
                            :error="errors.slug"
                        />
                        <p class="text-xs text-muted-foreground">
                            {{ $t("event_target.slug_help") }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="position">{{ $t("common.position") }}</Label>
                        <FormItemInput
                            id="position"
                            v-model.number="position"
                            type="number"
                            :placeholder="$t('event_target.position_placeholder')"
                            :error="errors.position"
                            min="0"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="scope">{{ $t("event_target.scope") }}</Label>
                        <FormItemSelect
                            id="scope"
                            v-model="scope"
                            :title="$t('event_target.scope')"
                            :placeholder="$t('action.select') + ' ' + $t('event_target.scope')"
                            :errors="errors.scope ? [errors.scope] : []"
                            :data="[
                                { id: 'INT', name: $t('event_target.scope_internal') },
                                { id: 'EXT', name: $t('event_target.scope_external') },
                                { id: 'ALL', name: $t('event_target.scope_all') },
                            ]"
                            key-value="id"
                            name-value="name"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="isSubmitting"
                            @click="handleClose"
                        >
                            {{ $t("action.cancel") }}
                        </Button>
                        <Button
                            v-if="dialogMode === 'add'"
                            type="button"
                            variant="outline"
                            :disabled="isSubmitting"
                            @click="handleSubmitAndAddNew"
                        >
                            {{ $t('action.save') + ' ' + $t('common.and') + ' ' + $t('action.add') + ' ' + $t('common.new') }}
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
                            {{
                                dialogMode === "add"
                                    ? $t("action.add")
                                    : $t("action.update")
                            }}
                        </Button>
                    </DialogFooter>
                </form>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { EventTarget, EventTargetForm } from '~/types';

const { t } = useI18n();

// Props
const props = defineProps<{
    isDialogOpen: boolean;
    dialogMode: 'add' | 'edit';
    editingEventTarget: EventTarget | null;
    isSubmitting: boolean;
}>();

// Emits — call-signature form so overload resolution works for submit events
const emit = defineEmits<{
    (e: 'update:isDialogOpen', value: boolean): void;
    (e: 'update:dialogMode', value: 'add' | 'edit'): void;
    (e: 'update:editingEventTarget', value: EventTarget | null): void;
    (e: 'submit-and-close' | 'submit-and-add-new', values: EventTargetForm): void;
    (e: 'close-dialog'): void;
}>();

// CRUD operations for form validation
const {
    defineField,
    handleSubmit: handleFormSubmit,
    errors,
    resetForm,
    setValues,
} = useCrud<EventTarget, EventTargetForm>({
    crudPath: 'event-targets',
    tenant: 'academy',
    formSchema: createEventTargetSchema(t),
});

// Form fields
const [code] = defineField('code');
const [name] = defineField('name');
const [slug] = defineField('slug');
const [position] = defineField('position');
const [scope] = defineField('scope');

// Auto-generate slug from name
watch(name, (newName) => {
    if (newName && !slug.value) {
        slug.value = newName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
});

// Watch for editing event target changes
watch(
    () => props.editingEventTarget,
    (eventTarget) => {
        if (eventTarget) {
            setValues({
                code: eventTarget.code,
                name: eventTarget.name,
                slug: eventTarget.slug,
                position: eventTarget.position,
                scope: eventTarget.scope,
            });
        }
    },
    { immediate: true },
);

const defaultEventTargetValues: EventTargetForm = {
    code: '',
    name: '',
    slug: '',
    position: 0,
    scope: 'ALL',
};

// Watch for dialog mode changes — reset with explicit values so errors clear (Zod v4 / vee-validate)
watch(
    () => props.dialogMode,
    (mode) => {
        if (mode === 'add') {
            nextTick(() => {
                resetForm({ values: defaultEventTargetValues });
            });
        }
    },
);

// Clear form when dialog closes
watch(
    () => props.isDialogOpen,
    (isOpen) => {
        if (!isOpen) {
            nextTick(() => {
                resetForm({ values: defaultEventTargetValues });
            });
        }
    },
);

// Form submission handlers
const handleSubmit = handleFormSubmit((values) => {
    emit('submit-and-close', values as EventTargetForm);
});

const handleSubmitAndAddNew = handleFormSubmit((values) => {
    emit('submit-and-add-new', values as EventTargetForm);
});

const handleClose = () => {
    emit('close-dialog');
};
</script>

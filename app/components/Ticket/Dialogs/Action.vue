<!--
  TicketActionDialog Component

  Dialog for adding a ticket action with a note.

  Props:
  - isOpen: boolean - Whether the dialog is open
  - selectedActionType: string - The selected action type
  - actionNote: string - The action note
  - isActionLoading: boolean - Whether the action is loading
  
  Emits:
  - update:isOpen: Triggered when dialog open state changes
  - update:actionNote: Triggered when note changes
  - submit: Triggered when action is confirmed
-->

<template>
    <Dialog
        :open="isOpen"
        @update:open="$emit('update:isOpen', $event)"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{{ $t("action.add") + " " + $t("action.singular") }}</DialogTitle>
                <DialogDescription>
                    {{
                        $t("action.add_description", { action: $t(`action.${selectedActionType}`) })
                    }}
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label for="action-note">{{ $t("note.singular") }}</Label>
                    <Textarea
                        id="action-note"
                        :model-value="actionNote"
                        :placeholder="$t('note.placeholder')"
                        rows="3"
                        @update:model-value="$emit('update:actionNote', $event)"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    @click="$emit('update:isOpen', false)"
                >
                    {{ $t("action.cancel") }}
                </Button>
                <Button
                    :disabled="isActionLoading"
                    @click="$emit('submit')"
                >
                    <Icon
                        v-if="isActionLoading"
                        name="solar:refresh-linear"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t("action.add") + " " + $t("action.singular") }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
defineProps<{
    isOpen: boolean;
    selectedActionType: string;
    actionNote: string;
    isActionLoading: boolean;
}>();

defineEmits<{
    'update:isOpen': [value: boolean];
    'update:actionNote': [value: string];
    submit: [];
}>();
</script>

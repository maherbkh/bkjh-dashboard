<!--
  TicketTransferDialog Component

  Dialog for transferring a ticket to another admin.

  Props:
  - isOpen: boolean - Whether the dialog is open
  - transferUserId: string | undefined - The selected admin ID
  - transferAdmins: Admin[] - List of available admins
  - loadingAdmins: boolean - Whether admins are loading
  - isActionLoading: boolean - Whether the transfer action is loading

  Emits:
  - update:isOpen: Triggered when dialog open state changes
  - update:transferUserId: Triggered when selected admin changes
  - submit: Triggered when transfer is confirmed
-->

<template>
    <Dialog
        :open="isOpen"
        @update:open="$emit('update:isOpen', $event)"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{{ $t("action.transfer") }}</DialogTitle>
                <DialogDescription>
                    {{ $t("action.transfer_description", { model: $t("ticket.singular") }) }}
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-4">
                <FormItemSelect
                    id="transfer-admin"
                    :model-value="transferUserId"
                    :title="$t('admin.singular')"
                    :placeholder="$t('admin.select')"
                    :data="transferAdmins"
                    key-value="id"
                    name-value="name"
                    :empty-text="$t('admin.no_admins_available')"
                    :disabled="loadingAdmins"
                    required
                    @update:model-value="$emit('update:transferUserId', $event)"
                />
                <p
                    v-if="loadingAdmins"
                    class="text-xs text-muted-foreground flex items-center gap-1"
                >
                    <Icon
                        name="solar:refresh-linear"
                        class="!size-3 animate-spin"
                    />
                    {{ $t("admin.loading") }}
                </p>
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    @click="$emit('update:isOpen', false)"
                >
                    {{ $t("action.cancel") }}
                </Button>
                <Button
                    :disabled="!transferUserId || isActionLoading"
                    @click="$emit('submit')"
                >
                    <Icon
                        v-if="isActionLoading"
                        name="solar:refresh-linear"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t("action.transfer") }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
import type { Admin } from '~/types';

defineProps<{
    isOpen: boolean;
    transferUserId?: string;
    transferAdmins: Admin[];
    loadingAdmins: boolean;
    isActionLoading: boolean;
}>();

defineEmits<{
    'update:isOpen': [value: boolean];
    'update:transferUserId': [value: string | undefined];
    'submit': [];
}>();
</script>

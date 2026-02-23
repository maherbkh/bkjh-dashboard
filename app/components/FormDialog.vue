<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    title: string;
    description?: string;
};

defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
}>();

const handleOpenChange = (value: boolean) => {
    emit('update:open', value);
};
</script>

<template>
    <Dialog
        :open="open"
        @update:open="handleOpenChange"
    >
        <DialogContent class="sm:max-w-6xl">
            <DialogHeader>
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription v-if="description">
                    {{ description }}
                </DialogDescription>
            </DialogHeader>
            <!-- Content slot (scrollable middle) -->
            <div class="min-h-0 overflow-y-auto p-4">
                <div class="grid gap-4">
                    <slot name="content" />
                </div>
            </div>
            <!-- Footer slot (fixed at bottom) -->
            <DialogFooter>
                <slot name="footer" />
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

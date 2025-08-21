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
            <Separator />
            <!-- Content slot -->
            <div class="grid gap-4 py-4">
                <slot name="content" />
            </div>
            <Separator />
            <!-- Footer slot -->
            <DialogFooter>
                <slot name="footer" />
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

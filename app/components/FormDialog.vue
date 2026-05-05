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
        <DialogContent
            class="sm:max-w-6xl"
            @pointer-down-outside="(e: any) => { if ((e.detail?.originalEvent?.target as Element)?.closest?.('.dp__menu, .dp--menu-wrapper')) e.preventDefault(); }"
            @focus-outside="(e: any) => { if ((e.detail?.originalEvent?.target as Element)?.closest?.('.dp__menu, .dp--menu-wrapper')) e.preventDefault(); }"
        >
            <DialogHeader>
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription v-if="description">
                    {{ description }}
                </DialogDescription>
            </DialogHeader>
            <!-- Content slot (scrollable middle) -->
            <div class="min-h-0 overflow-x-hidden overflow-y-auto px-0 pr-5 scroll-app">
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

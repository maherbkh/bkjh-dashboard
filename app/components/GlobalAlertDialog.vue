<template>
    <AlertDialog v-model:open="alertDialogState.isOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ alertDialogState.title }}</AlertDialogTitle>
                <AlertDialogDescription>
                    {{ alertDialogState.description }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="cancel">
                    {{ alertDialogState.cancelText }}
                </AlertDialogCancel>
                <AlertDialogAction @click="confirm">
                    {{ alertDialogState.confirmText }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
const { state: alertDialogState, confirm, cancel } = useAlertDialog();
</script>

import type { AlertDialogOptions, AlertDialogState } from '~/types';

// Create a global state that persists across all instances
let globalState: AlertDialogState | null = null;

export function useAlertDialog() {
    // Move useI18n to the top level of the composable
    const { t } = useI18n();

    // Use the global state or create it if it doesn't exist
    if (!globalState) {
        globalState = reactive<AlertDialogState>({
            isOpen: false,
            title: '',
            description: '',
            confirmText: '',
            cancelText: '',
            resolve: undefined,
        });
    }

    const state = globalState;

    const showAlertDialog = (options: AlertDialogOptions = {}): Promise<boolean> => {
        return new Promise((resolve) => {
            state.title = options.title || t('global.confirm');
            state.description = options.description || t('global.are_you_sure');
            state.confirmText = options.confirmText || t('global.confirm');
            state.cancelText = options.cancelText || t('action.cancel');
            state.resolve = resolve;
            state.isOpen = true;
        });
    };

    const hideAlertDialog = () => {
        state.isOpen = false;
        state.resolve = undefined;
    };

    const confirmAlertDialog = () => {
        if (state.resolve) {
            state.resolve(true);
        }
        hideAlertDialog();
    };

    const cancelAlertDialog = () => {
        if (state.resolve) {
            state.resolve(false);
        }
        hideAlertDialog();
    };

    return {
        state,
        show: showAlertDialog,
        hide: hideAlertDialog,
        confirm: confirmAlertDialog,
        cancel: cancelAlertDialog,
    };
}

// Convenience functions for common use cases
export function useConfirmDialog() {
    // Move useI18n to the top level of the composable
    const { t } = useI18n();
    const { show } = useAlertDialog();

    const confirmDelete = (itemName?: string): Promise<boolean> => {
        const options = {
            title: t('global.common.confirm_delete_title') || 'Confirm Deletion',
            description: itemName
                ? (t('global.common.confirm_delete_item', { item: itemName }) || `Are you sure you want to delete '${itemName}'?`)
                : (t('global.common.delete_confirmation') || 'Are you sure you want to delete this item?'),
            confirmText: t('action.delete') || 'Delete',
            cancelText: t('action.cancel') || 'Cancel',
        };
        return show(options);
    };

    const confirmBulkDelete = (count: number): Promise<boolean> => {
        return show({
            title: t('global.common.confirm_bulk_delete_title') || 'Confirm Bulk Deletion',
            description: t('global.common.confirm_bulk_delete_count', { count }) || `Are you sure you want to delete ${count} selected items?`,
            confirmText: t('action.delete') || 'Delete',
            cancelText: t('action.cancel') || 'Cancel',
        });
    };

    return {
        confirmDelete,
        confirmBulkDelete,
    };
}

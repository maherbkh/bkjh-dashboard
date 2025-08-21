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
        console.log('showAlertDialog called', options);
        console.log('Current state before update:', { ...state });
        return new Promise((resolve) => {
            state.title = options.title || t('global.ui.confirm');
            state.description = options.description || t('global.ui.are_you_sure');
            state.confirmText = options.confirmText || t('global.ui.confirm');
            state.cancelText = options.cancelText || t('global.ui.cancel');
            state.resolve = resolve;
            state.isOpen = true;
            console.log('State after update:', { ...state });
        });
    };

    const hideAlertDialog = () => {
        state.isOpen = false;
        state.resolve = undefined;
    };

    const confirmAlertDialog = () => {
        console.log('confirmAlertDialog called');
        if (state.resolve) {
            state.resolve(true);
        }
        hideAlertDialog();
    };

    const cancelAlertDialog = () => {
        console.log('cancelAlertDialog called');
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
        console.log('confirmDelete called with itemName:', itemName);
        const options = {
            title: t('global.common.confirm_delete_title') || 'Confirm Deletion',
            description: itemName
                ? (t('global.common.confirm_delete_item', { item: itemName }) || `Are you sure you want to delete '${itemName}'?`)
                : (t('global.common.delete_confirmation') || 'Are you sure you want to delete this item?'),
            confirmText: t('global.actions.delete') || 'Delete',
            cancelText: t('global.ui.cancel') || 'Cancel',
        };
        console.log('confirmDelete options:', options);
        return show(options);
    };

    const confirmBulkDelete = (count: number): Promise<boolean> => {
        return show({
            title: t('global.common.confirm_bulk_delete_title') || 'Confirm Bulk Deletion',
            description: t('global.common.confirm_bulk_delete_count', { count }) || `Are you sure you want to delete ${count} selected items?`,
            confirmText: t('global.actions.delete') || 'Delete',
            cancelText: t('global.ui.cancel') || 'Cancel',
        });
    };

    return {
        confirmDelete,
        confirmBulkDelete,
    };
}

export interface IdNameActiveItem {
    id: string;
    name: string;
    isActive?: boolean;
}

/**
 * Map id/name entities (e.g. from the resources store) to FormItemSelect-style options.
 */
export function toIdNameSelectOptions(
    items: ReadonlyArray<IdNameActiveItem>,
    opts?: { onlyActive?: boolean; excludeIds?: ReadonlySet<string> },
): Array<{ value: string; label: string }> {
    return items
        .filter((i) => {
            if (opts?.onlyActive && i.isActive === false) {
                return false;
            }
            if (opts?.excludeIds?.has(i.id)) {
                return false;
            }
            return true;
        })
        .map(i => ({ value: i.id, label: i.name }));
}

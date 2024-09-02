import { ActionContextMenuItem } from "../action-context-menu-item";
import { getContaineePairedWithContainer, onToggleDraggability, onToggleDroppability } from "./dnd-utils";

export function appendToContextMenuItems(
    existingItems: ActionContextMenuItem[],
    itemsToAppend: ActionContextMenuItem[]
): ActionContextMenuItem[] {
    return [...existingItems, ...itemsToAppend];
}

// Come back and refact, pass in setDndItems as a prop
/*export const onToggleLock = (id: string | number): void => {
    onToggleDraggability(setDndItems, id);
}*/
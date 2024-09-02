export interface ActionContextMenuItem {
    name: string;
    onClick: (id: string | number) => void;
}
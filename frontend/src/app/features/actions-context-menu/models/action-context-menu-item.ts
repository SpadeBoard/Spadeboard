export interface ActionContextMenuItem {
    id: number;
    name: string;
    disabled: boolean;
    action: (params?: any) => any;
}

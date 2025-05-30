export interface ActionContextMenuItem {
    id: number;
    name: string;
    disabled: boolean;
    action: (param?: any) => any;
}

export interface ActionContextMenuItem {
    id: number;
    name: string;
    action: (param?: any) => any;
}

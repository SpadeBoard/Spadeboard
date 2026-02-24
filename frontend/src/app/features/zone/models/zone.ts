import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { DndPosition } from "../../drag-and-drop/models/dnd-position";
import { Style } from "../../style/models/style";

export interface Zone extends DndItem {
    zoneId: number;
    containeeIds: number[];
    maxChildren?: number;
    style?: Style; // TODO: Remove
    dndPosition: DndPosition // TODO: Remove
}

export interface ZoneDto {
    zone: Zone;
    style?: Style;
    dndItem: DndItem;
    dndPosition: DndPosition;
    // gameRoom: GameRoom;
}

// TODO: Make a zone bridge table, which has Zone, DndItem, DndPosition, GameRoom
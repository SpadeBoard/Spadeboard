import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragPreview, CdkDragStart, DragRef, Point } from '@angular/cdk/drag-drop';

import { Component, ElementRef, inject, input, InputSignal, output, OutputEmitterRef, QueryList, ViewChildren } from '@angular/core';
import { ActionContextMenuItem } from '../../../../shared/actions/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../../shared/actions/services/action-context-menu.service';
import { Coordinates, Dimensions, getScaledItemRenderDimensions, logInfo } from '../../../../utils/utils';
import { DndBoardService } from '../../../drag-and-drop/board/service/dnd-board.service';
import { DndPosition } from '../../../drag-and-drop/models/dnd-position';
import { snapToGridCellCentre, snapToGridNearestVertex } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { GameRoomService } from '../../../game-room/services/core/game-room.service';
import { CardEditorCardDto } from '../../card-editor/models/card-editor-card-dto';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../card-face/constants/card-face.constants';
import { CardFaceImage } from '../../card-face/utils/card-face.utils';
import { CardComponent } from '../../card/components/core/card.component';
import { DEFAULT_CARD_SCALE } from '../../utils/card.constants';
import { CardPositionPerRoom } from '../model/card-position-per-room';
import { CardPositionPerRoomApiService } from '../services/api/card-position-per-room-api.service';
import { CardPositionPerRoomOperationsService } from '../services/operations/card-position-per-room-operations.service';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
    CdkDragPreview,
    CardComponent
  ],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.scss'
})
export class CardPositionPerRoomComponent {
  // TODO: We need to refactor this and move the services out of here, and instead pass in via input signals instead, is gonna be helpful for the layers especially
  private readonly cardPositionPerRoomApiService: CardPositionPerRoomApiService = inject<CardPositionPerRoomApiService>(CardPositionPerRoomApiService);

  private readonly cardPositionPerRoomOperationsService: CardPositionPerRoomOperationsService = inject<CardPositionPerRoomOperationsService>(CardPositionPerRoomOperationsService);

  private readonly dndBoardService: DndBoardService = inject<DndBoardService>(DndBoardService);

  private readonly gameRoomService: GameRoomService = inject<GameRoomService>(GameRoomService);

  protected readonly cardDragPreviewPlaceholder: CardFaceImage = getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_DIMENSIONS);

  protected cprs: CardPositionPerRoom[] = [];

  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  private readonly actionContextMenuService: ActionContextMenuService = inject<ActionContextMenuService>(ActionContextMenuService);

  @ViewChildren('cardsPositionPerRoom') cardsPositionPerRoomRef!: QueryList<ElementRef<HTMLDivElement>>;

  // TODO: The culling should be handled in the parent itself
  public readonly $cprs: InputSignal<CardPositionPerRoom[]> = input<CardPositionPerRoom[]>([]); 

  public readonly $scale: InputSignal<number> = input<number>(DEFAULT_CARD_SCALE);

  public readonly $shouldCloseOnPerformActions: InputSignal<boolean> = input<boolean>(false);

  public readonly $scaledCellSize: InputSignal<number> = input<number>(0);

  public readonly $setPosition: OutputEmitterRef<{
    id: string,
    position: Coordinates
  }>= output<{
    id: string,
    position: Coordinates
  }>();

  // NOTE: For rendering only
  protected unculled: CardPositionPerRoom[] = []; // TODO: Remove

  // TODO: Refactor the bloody architecture
  private dragOffset: Coordinates = { x: 0, y: 0 };

  protected currentContentMenuCpr: CardPositionPerRoom | undefined = undefined;

  // TODO: Replace screen position cache with just a style cache
  private screenPositionCache = new Map<string, Coordinates>();
  
  private actionContextMenuId: string = '';

  private actionContextMenuLocation: Coordinates = {
    x: 0,
    y: 0
  };

  protected getCardScreenPosition(cpr: CardPositionPerRoom): Coordinates {
    let key: string = cpr.cardPositionPerRoomId;

    if (this.screenPositionCache.has(key)) {
      return this.screenPositionCache.get(key)!;
    }

    let aU: Coordinates = {
      x: cpr.dndPosition.x,
      y: cpr.dndPosition.y
    }

    let pos: Coordinates = this.calculateScreenPosition(aU);
    this.screenPositionCache.set(key, pos);
    return pos;
  }

  // NOTE: Reset it when there's no more cards in the room
  // Reset the global zIndex counter only if you anticipate integer overflow, 
  // performance issues, 
  // or want to keep your zIndex values manageable for debugging and maintenance

  // TODO: Pass in the cpr here as a parameter to determine whether you can rotate?
  private actionContextMenuItems: ActionContextMenuItem[] = [];

  get cprActionContextMenuItems(): ActionContextMenuItem[] {
    return this.actionContextMenuItems;
  }

  constructor() {
    // this.updateGridSize();
    this.setActionContextMenuItems();
  }

  public ngOnInit(): void {
    this.onUpdateCamera();

    this.setOnScreenCprs();
  }

  private setActionContextMenuItems(): void {
    this.actionContextMenuItems = this.cardPositionPerRoomOperationsService.getMenuItems();
  }

  // CHECKME: Remove?
  private onUpdateCamera(): void {
    this.dndBoardService.onUpdateCamera$.subscribe(() => {
      this.updateCardsPositionPerRoom(this.unculled);

      this.screenPositionCache.clear();
      this.setOnScreenCprs();
    })
  }


  // TODO: Make an observable that filters out all items not in camera viewport
  // Have a function to replace cprs and then render them
  // TODO: Make this a computed signal instead
  private setOnScreenCprs(): void {
    if (this.cprs.length > 0) this.unculled = this.getOnScreenCprs(this.dndBoardService.getViewportDimensions());
  }

  // TODO: Remove this
  public getOnScreenCprs(screen: Dimensions): CardPositionPerRoom[] {
    return this.cprs.filter(cpr => this.dndBoardService.isPositionInCameraSpace({ x: cpr.dndPosition.x, y: cpr.dndPosition.y }, screen) == true);
  }

  // NOTE: Assumes the dndPosition is in AU and set to the mouse AU coordinates
  public calculateScreenPosition(aU: Coordinates): Coordinates {
    return this.dndBoardService.aUToScreenCoordinates(aU);
  }

  // TODO: Get the card via the ID as well as position

  private updateCardsPositionPerRoom(cprs: CardPositionPerRoom[]) {
    cprs.forEach((cpr: CardPositionPerRoom) => {
      this.updateCardPositionPerRoom(cpr);
    })
  }

  // CHECKME: Do we even need this? Because it's pass by reference
  private updateCardPositionPerRoom(updatedCpr: CardPositionPerRoom) {
    // TODO: Just modify the cpr inside of the $cpr models
    let cprToReplace = this.cardPositionPerRoomOperationsService.getCpr(updatedCpr.card.cardId, this.cprs);

    if (cprToReplace !== undefined) {
      // TODO: Get rid of this whole function
      // console.log(`Cpr to replace: ${JSON.stringify(cprToReplace)}, Updated CPR: ${JSON.stringify(updatedCpr)}`);

      Object.assign(cprToReplace, updatedCpr);

      // Force unculled refresh
      this.refreshUnculledCprs();
    }
  }

  // TODO: Remove
  private refreshUnculledCprs(): void {
    let dimensions = this.dndBoardService.getViewportDimensions();
    this.unculled = this.getOnScreenCprs(dimensions);
  }

  // NOTE: Drag offset will always be in AU
  public setDragOffset(mouseAUCoordinates: Coordinates, dndPosition: DndPosition): void {
    this.dragOffset = {
      x: mouseAUCoordinates.x - dndPosition.x,
      y: mouseAUCoordinates.y - dndPosition.y
    };
  }

  // NOTE Don't ever set the positioning, preview's not absolutely positioned
  private setPreviewTransform(id: string, translation: Coordinates, rotation: number): void {
    let preview: HTMLElement | null = document.querySelector(
      `[cpr-cdk-drag-preview-id="${id}"]`
    ) as HTMLElement | null;

    if (!preview)
      throw new Error("Preview doesn't exist, which means two things, we're passing the wrong id, or we're getting a nonexistent ID somehow");

    // TODO: If snap to grid, then run snap to grid else do what we have currently
    translation = this.snapToGrid(translation);

    preview.style.transform = `translate3d(${translation.x}px, ${translation.y}px, 0) rotate(${rotation}deg)`;
  }

  protected onDragStarted(event: CdkDragStart<any>, item: CardPositionPerRoom): void {
    // NOTE: By this point there should already be a cached position of the cpr
    let position: Coordinates | undefined = this.screenPositionCache.get(item.cardPositionPerRoomId);

    if (!position)
      throw new Error("By this point there should already be a cached position of the cpr");

    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.setDragOffset(this.dndBoardService.mouseAUCoordinates, item.dndPosition);

    // NOTE: By this point there should already be a cached position of the cpr
    // ASSUMPTION: When you start dragging, the item shouldn't be culled
    this.setPreviewTransform(item.cardPositionPerRoomId, position, item.dndRotation.degrees);
  }

  public getDragMovedOffset(mouseAUCoordinates: Coordinates, dragOffset: Coordinates): Coordinates {
    let aU: Coordinates = this.calculateAbsolutePosition(mouseAUCoordinates, dragOffset);
    let screen: Coordinates = this.dndBoardService.aUToScreenCoordinates(aU);

    return screen;
  }

  protected onDragMoved(event: CdkDragMove, item: CardPositionPerRoom): void {
    // WORKAROUND: We'll programmatically set the custom preview's transform, we just need to make sure that we set it on drag start too
    // They all have IDs, it should be apossible to grab them
    this.setPreviewTransform(item.cardPositionPerRoomId, this.getDragMovedOffset(this.dndBoardService.mouseAUCoordinates, this.dragOffset), item.dndRotation.degrees);
  }

  protected onDragDrop(event: CdkDragDrop<any[]>, item: CardPositionPerRoom): void {
    item.zIndex = this.dndBoardService.globalZIndexCounter++;
    this.setCardPerRoomPosition(item, this.dndBoardService.mouseAUCoordinates, this.dragOffset);


    // If it's overlapping another item
    // this.cullOverlappedItems(item.cardPositionPerRoomId, attributes.coordinates, attributes.dimensions));

    this.updateCardPositionPerRoom(item);
  }

  public calculateAbsolutePosition(mouseAUCoordinates: Coordinates, dragOffset: Coordinates): Coordinates {
    return {
      x: mouseAUCoordinates.x - dragOffset.x,
      y: mouseAUCoordinates.y - dragOffset.y
    }
  }

  public setCardPerRoomPosition(cpr: CardPositionPerRoom, mouseAUCoordinates: Coordinates, dragOffset: Coordinates) {
    let position: Coordinates = this.calculateAbsolutePosition(mouseAUCoordinates, dragOffset);

    cpr.dndPosition = {
      ...cpr.dndPosition,
      x: position.x,
      y: position.y
    };

    this.$setPosition.emit({
      id: cpr.cardPositionPerRoomId,
      position
    });

    // CHECKME: Do we want to actually set the screen position directly here?
    // It would make Angular spend less time calculating and the detection of its position will be faster
    this.screenPositionCache.set(cpr.cardPositionPerRoomId, this.snapToGrid(this.calculateScreenPosition({
      x: cpr.dndPosition.x,
      y: cpr.dndPosition.y
    })));

    // CHECKME: Problem is, with that approach my concern is
    // In the edge case where you drag the item off screen, and the viewport scrolls, what then
    // Wouldn't the position be wrong
    // this.screenPositionCache.delete(cpr.cardPositionPerRoomId);
  }

  private snapToGrid(coordinates: Coordinates): Coordinates {
    if (this.$shouldSnapToGrid()) {
      return snapToGridNearestVertex(this.$scaledCellSize(), coordinates);
    }

    return coordinates;
  }

  // https://stackoverflow.com/a/69324787
  // FIXME: Only works with standalone drags
  protected computeDragRenderPos(userPointerPosition: Point, dragRef: DragRef, dimensions: DOMRect, pickupPositionInElement: Point): Coordinates {
    let gridSize: number = 50;
    let { offsetX, offsetY } = snapToGridCellCentre(gridSize, userPointerPosition.x, userPointerPosition.y);

    // console.log(`Offset computeDragRenderPos: ${JSON.stringify({offsetX, offsetY})}`);

    return { x: offsetX, y: offsetY };
  }

  protected onCardRightClick(event: MouseEvent, cardId: string): void {
    event.preventDefault();

    let potentialCurrentContextMenuCpr: CardPositionPerRoom | undefined = this.cardPositionPerRoomOperationsService.getCpr(cardId, this.$cprs());

    if (!potentialCurrentContextMenuCpr) throw new Error(`${logInfo(this.constructor.name, this.onCardRightClick.name)}: Current context menu CPR is undefined`);

    this.currentContentMenuCpr = potentialCurrentContextMenuCpr;

    this.actionContextMenuLocation = {
      x: event.clientX,
      y: event.clientY
    };

    this.setActionContextMenu(this.actionContextMenuLocation);
  }

  private setActionContextMenu(location: Coordinates): void {
    if (!this.actionContextMenuId) {
      this.actionContextMenuId = this.actionContextMenuService.open
        (
          this.actionContextMenuItems,
          (item: ActionContextMenuItem) => this.performAction(item),
          this.actionContextMenuService.getStyle(location),
          () => this.onClosedActionContextMenu(),
          this. $shouldCloseOnPerformActions()
        );
    }
    else {
      this.actionContextMenuService.setStyle(
        this.actionContextMenuId,
        this.actionContextMenuService.getStyle(location)
      )
    }

    if (!this.currentContentMenuCpr) return;

    this.cardPositionPerRoomOperationsService.setDisableContextMenuItems(this.actionContextMenuItems, this.currentContentMenuCpr);
  }

  private onClosedActionContextMenu(): void {
    this.resetCurrentMenuCpr();
    this.resetActionContextMenuId();
    this.resetActionContextMenuLocation();
  }

  private resetCurrentMenuCpr(): void {
    this.currentContentMenuCpr = undefined;
  }

  private resetActionContextMenuId(): void {
    this.actionContextMenuId = '';
  }

  private resetActionContextMenuLocation(): void {
    this.actionContextMenuLocation = {
      x: -1,
      y: -1
    };
  }

  protected performAction(item: ActionContextMenuItem): void {
    switch (item.id) {
      case 0: {
        item.action(this.currentContentMenuCpr);
        break;
      }
      case 1:
      case 2: {
        item.action({ cpr: this.currentContentMenuCpr, degrees: 45 });
        break;
      }
      case 3: {
        item.action({ cpr: this.currentContentMenuCpr });
        break;
      }
      case 4: {
        item.action({ cpr: this.currentContentMenuCpr, screenPositionCache: this.screenPositionCache });
        break;
      }
    }

    if (!this. $shouldCloseOnPerformActions()) this.setActionContextMenu(this.actionContextMenuLocation);
  }

  // TODO: Get rid of this
  protected getCardDragPreviewPlaceholderDimensions(): Dimensions {
    return getScaledItemRenderDimensions(this.cardDragPreviewPlaceholder.dimensions, this.$scale());
  }
}
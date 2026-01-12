import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragPreview, CdkDragStart, DragRef, Point } from '@angular/cdk/drag-drop';

import { Component, computed, effect, ElementRef, HostListener, inject, input, InputSignal, QueryList, Signal, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mergeMap } from 'rxjs';
import { Coordinates, Dimensions, getScaledItemRenderDimensions } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { snapToGridCellCentre, snapToGridNearestVertex } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardPositionPerRoomApiService } from '../../services/card-game-core/api/card-position-per-room-api.service';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardPositionPerRoomService } from '../../services/card-game-core/card-position-per-room/card-position-per-room.service';
import { CardPositionPerRoomOperationsService } from '../../services/card-game-core/card-position-per-room/operations/card-position-per-room-operations.service';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../utils/card-face.constants';
import { CardFaceImage } from '../../utils/card-face.utils';
import { DEFAULT_CARD_SCALE } from '../../utils/card.constants';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
    CdkDragPreview,
    CardComponent,
    ActionContextMenuComponent
],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.scss'
})
export class CardPositionPerRoomComponent {
  private readonly cardPositionPerRoomApiService: CardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);

  private readonly cardPositionPerRoomOperationsService: CardPositionPerRoomOperationsService = inject(CardPositionPerRoomOperationsService);

  private readonly cardPositionPerRoomService: CardPositionPerRoomService = inject(CardPositionPerRoomService);

  private readonly dndBoardService: DndBoardService = inject(DndBoardService);

  private readonly gameRoomService: GameRoomService = inject(GameRoomService);

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  protected readonly cardDragPreviewPlaceholder: CardFaceImage = getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_DIMENSIONS);

  private readonly el: ElementRef<any> = inject(ElementRef);

  protected cprs: CardPositionPerRoom[] = [];

  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  @ViewChildren('cardsPositionPerRoom') cardsPositionPerRoomRef!: QueryList<ElementRef<HTMLDivElement>>;

  // NOTE: For rendering only
  protected unculled: CardPositionPerRoom[] = [];

  // TODO: Refactor the bloody architecture
  // TODO: Replace the card scale here
  protected cardsPositionPerRoomScale: number = DEFAULT_CARD_SCALE;

  private dragOffset: Coordinates = { x: 0, y: 0 };

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };

  protected currentContentMenuCpr: CardPositionPerRoom | undefined = undefined;

  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updateCard(cardEditorCardDto)],
    ['delete', (cardId: string) => this.deleteCard(cardId)]
  ]);

  // TODO: Finish this
  private dndBoardTransformations: Map<string, Function> = new Map<string, Function>([
    ['translation', (cardEditorCardDto: CardEditorCardDto) => this.updateCard(cardEditorCardDto)],
    ['scale', (itemRenderScale: number, screenPositionCache: Map<string, Coordinates>, cardsPositionPerRoomScale: number) => this.onScaleTransformation(itemRenderScale, screenPositionCache, cardsPositionPerRoomScale)]
  ]);

  // TODO: Replace screen position cache with just a style cache
  private screenPositionCache = new Map<string, Coordinates>();

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

    this.onCardEditorCardDtoOperations();

    this.onShowAllItems();

    effect(() => {
      if (parseFloat(this.gameRoomService.currentGameRoomId()) > 0) {
        this.getCardsPositionPerRoomByRoomId(this.gameRoomService.currentGameRoomId());
      }
    });
  }

 public ngOnInit(): void {
    this.createCardPositionPerRoom();
    this.updateCardPositionPerRoomOnSave();

    this.onUpdateCamera();
    this.onMouseMove();
    this.setCardsZoomLevel();

    this.setOnScreenCprs();
  }

  private setActionContextMenuItems():  void{
    this.actionContextMenuItems = this.cardPositionPerRoomOperationsService.getMenuItems();
  }

  private onUpdateCamera(): void {
    this.dndBoardService.onUpdateCamera$.subscribe(() => {
      this.updateCardsPositionPerRoom(this.unculled);

      this.screenPositionCache.clear();
      this.setOnScreenCprs();
    })
  }


  // TODO: Make an observable that filters out all items not in camera viewport
  // Have a function to replace cprs and then render them
  private setOnScreenCprs(): void {
    if (this.cprs.length > 0) this.unculled = this.getOnScreenCprs(this.dndBoardService.getViewportDimensions());
  }

  public getOnScreenCprs(screen: Dimensions): CardPositionPerRoom[] {
    return this.cprs.filter(cpr => this.dndBoardService.isPositionInCameraSpace({ x: cpr.dndPosition.x, y: cpr.dndPosition.y }, screen) == true);
  }

  // NOTE: Assumes the dndPosition is in AU and set to the mouse AU coordinates
  public calculateScreenPosition(aU: Coordinates): Coordinates {
    return this.dndBoardService.aUToScreenCoordinates(aU);
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: { mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number }) => {
      let mouseMoveLog = `Card position per room - On Mouse Move:
      Mouse Screen coordinates (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
      Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.mouseAUCoordinates)})
      Mouse AU to Screen coordinates: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.mouseAUCoordinates))})
      Camera coordinates AU: (${JSON.stringify(this.dndBoardService.getCameraCoordinates())})
      Grid size AU: ${this.dndBoardService.getGridSizeAU()}
      Zoom Level: ${this.dndBoardService.zoom}`;

      // 3. Log everything
      // console.log(mouseMoveLog);
    })
  }

  // TODO: Refactor this into the dndBoardService
  private setCardsZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {
      let itemRenderScale: number = this.dndBoardService.getItemRenderScale();

      if (itemRenderScale !== 0) {
        this.screenPositionCache.clear(); // CHECKME: Do we actually want to clear the cache here and only if this check is valid?
        this.cardsPositionPerRoomScale = itemRenderScale;

        this.setOnScreenCprs(); // Force to refresh the unculled cprs
      }
    })
  }

  private onScaleTransformation(itemRenderScale: number, screenPositionCache: Map<string, Coordinates>, cardsPositionPerRoomScale: number): void {
    if (itemRenderScale !== 0) {
      screenPositionCache.clear(); // CHECKME: Do we actually want to clear the cache here and only if this check is valid?
      cardsPositionPerRoomScale = itemRenderScale;

      this.setOnScreenCprs(); // Force to refresh the unculled cprs
    }
  }

  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  private getCardsPositionPerRoomByRoomId(gameRoomId: string): void {
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined) {
          this.cprs = result;

          this.screenPositionCache.clear();
          this.refreshUnculledCprs();

          this.dndBoardService.globalZIndexCounter = Math.max(...this.cprs.map(c => c.zIndex)) + 1;
        }
      });
  }

  // 50830.3 * 50 * 1 = 2,541,515
  private createCardPositionPerRoom(): void {
    this.cardPositionPerRoomService.createdCardPositionPerRoom$
      .pipe(
        mergeMap((cpr: CardPositionPerRoom) => {
          return this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr);
        })
      )
      .subscribe((result: CardPositionPerRoom | undefined) => {
        if (result !== undefined) {
          // console.log(`Create card position per room: ${JSON.stringify(result)}`);
          this.cprs.push(result);

          this.refreshUnculledCprs();
        }
      });
  }

  // TODO: Get the card via the ID as well as position

  private updateCardsPositionPerRoom(cprs: CardPositionPerRoom[]) {
    cprs.forEach((cpr: CardPositionPerRoom) => {
      this.updateCardPositionPerRoom(cpr);
    })
  }

  private updateCardPositionPerRoom(updatedCpr: CardPositionPerRoom) {
    let cprToReplace = this.cardPositionPerRoomOperationsService.getCpr(updatedCpr.card.cardId, this.cprs);

    if (cprToReplace !== undefined) {
      // TODO: Get rid of this whole function
      // console.log(`Cpr to replace: ${JSON.stringify(cprToReplace)}, Updated CPR: ${JSON.stringify(updatedCpr)}`);

      Object.assign(cprToReplace, updatedCpr);

      // Force unculled refresh
      this.refreshUnculledCprs();
    }
  }

  private refreshUnculledCprs(): void {
    let dimensions = this.dndBoardService.getViewportDimensions();
    this.unculled = this.getOnScreenCprs(dimensions);
  }

  private updateCardPositionPerRoomOnSave(): void {
    this.gameRoomService.onSaveGameRoom$.subscribe(() => {
      // Keeps order clean and predictable, prevents potential overflow
      this.normaliseZIndexes();

      console.log(`Update card position per room on save: ${JSON.stringify(this.cprs)}`);

      this.cardPositionPerRoomApiService.updateCardsPositionPerRoom(this.cprs).subscribe((cprs: CardPositionPerRoom[] | undefined) => {
        if (cprs !== undefined) {
          // console.log(`Updated CPRs on save: ${JSON.stringify(cprs)}`);
          this.cprs = cprs;

          // CHECKME: Do we ever actually want to clear this?
          this.screenPositionCache.clear();
          this.refreshUnculledCprs(); // FIXED: Force rerendering in order to make sure the flip, rotate works immediately after saving
        }
      });
    });
  }

  private onCardEditorCardDtoOperations(): void {
    this.cardEditorApiService.onOperations(this.cardEditorCardDtoOperations);
  }

  private updateCard(cardEditorCardDto: CardEditorCardDto): void {
    if (cardEditorCardDto) {
      let index: number = this.cprs.findIndex(cpr => cpr.card.cardId === cardEditorCardDto.card.cardId);

      if (index !== -1) this.cprs[index].card = cardEditorCardDto.card;
    }
  }

  private deleteCard(cardId: string): void {
    this.unculled = this.unculled.filter(cpr => cpr.card.cardId !== cardId);

    // Again, this is in case if the user scrolls away from the current card being deleted, for instance
    this.cprs = this.cprs.filter(cpr => cpr.card.cardId !== cardId);

    // Reset the counter to prevent integer overflow
    if (this.cprs.length <= 0) this.dndBoardService.globalZIndexCounter = 0;
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

  getDragMovedOffset(mouseAUCoordinates: Coordinates, dragOffset: Coordinates): Coordinates {
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

  calculateAbsolutePosition(mouseAUCoordinates: Coordinates, dragOffset: Coordinates): Coordinates {
    return {
      x: mouseAUCoordinates.x - dragOffset.x,
      y: mouseAUCoordinates.y - dragOffset.y
    }
  }

  setCardPerRoomPosition(cpr: CardPositionPerRoom, mouseAUCoordinates: Coordinates, dragOffset: Coordinates) {
    let position: Coordinates = this.calculateAbsolutePosition(mouseAUCoordinates, dragOffset);

    cpr.dndPosition = {
      dndPositionId: cpr.dndPosition.dndPositionId,
      x: position.x,
      y: position.y
    };

    let aU: Coordinates = {
      x: cpr.dndPosition.x,
      y: cpr.dndPosition.y
    }

    // CHECKME: Do we want to actually set the screen position directly here?
    // It would make Angular spend less time calculating and the detection of its position will be faster
    let onScreenPosition: Coordinates = this.calculateScreenPosition(aU);

    this.screenPositionCache.set(cpr.cardPositionPerRoomId, this.snapToGrid(onScreenPosition));

    // CHECKME: Problem is, with that approach my concern is
    // In the edge case where you drag the item off screen, and the viewport scrolls, what then
    // Wouldn't the position be wrong
    // this.screenPositionCache.delete(cpr.cardPositionPerRoomId);
  }

  // NOTE: Just to make sure that they all have unique IDs
  // Because the issue is despite overlapping
  // They can share the same zIndex, so the order ends up being dependent on the DOM
  normaliseZIndexes() {
    // Use all cprs, not just unculled
    let sorted: CardPositionPerRoom[] = this.cprs.slice().sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((cpr, idx) => cpr.zIndex = idx);

    this.dndBoardService.globalZIndexCounter = sorted.length + 1;
  }

  getCardPositionPerRoomRectById(cardPositionPerRoomId: string): DOMRect | null {
    let element: ElementRef<HTMLDivElement> | undefined = this.cardsPositionPerRoomRef.find(ref =>
      ref.nativeElement.getAttribute('card-position-per-room-id') === cardPositionPerRoomId
    );

    return element ? element.nativeElement.getBoundingClientRect() : null;
  }

  private snapToGrid(coordinates: Coordinates): Coordinates {
    if (this.$shouldSnapToGrid()) {
      return snapToGridNearestVertex(this.dndBoardService.getScaledCellSize(), coordinates);
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

    // Get the parent element and its bounding rect
    let parentElement: HTMLElement | null = this.el.nativeElement.parentElement;
    if (!parentElement) return;

    let parentRect: DOMRect = parentElement.getBoundingClientRect();

    // Calculate menu position relative to parent
    this.contextMenuPosition = {
      x: event.clientX - parentRect.left,
      y: event.clientY - parentRect.top
    }

    let potentialCurrentContextMenuCpr: CardPositionPerRoom | undefined = this.cardPositionPerRoomOperationsService.getCpr(cardId, this.cprs);

    if (!potentialCurrentContextMenuCpr)
      throw new Error("Current context menu CPR is undefined");

    this.currentContentMenuCpr = potentialCurrentContextMenuCpr;

    this.cardPositionPerRoomOperationsService.setDisableContextMenuItems(this.actionContextMenuItems, this.currentContentMenuCpr);
  }

  @HostListener('document:click')
  protected documentClick(): void {
    this.currentContentMenuCpr = undefined;
  }

  protected getRightClickMenuStyle(): {
    position: string;
    left: string;
    top: string;
    zIndex: number;
  } {
    return {
      position: 'absolute',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`,
      zIndex: this.dndBoardService.globalZIndexCounter // FIXED: Context menu can be behind the item that it's clicked on
    }
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
      case 3:
      case 4: {
        item.action({ cpr: this.currentContentMenuCpr, cardEditorPreviewService: this.cardEditorPreviewService, screenPositionCache: this.screenPositionCache });
        break;
      }
    }
  }

  // TODO: Refactor this as we're probably going to have more items than just cards
  private onShowAllItems(): void {
    this.dndBoardService.onShowAllItems$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      let coordinates: Coordinates[] = this.cprs.map(cpr => ({
        x: cpr.dndPosition.x,
        y: cpr.dndPosition.y
      }));

      this.dndBoardService.showAllItems(coordinates);
    })
  }

  protected getCardDragPreviewPlaceholderDimensions(): Dimensions {
    return getScaledItemRenderDimensions(this.cardDragPreviewPlaceholder.dimensions, this.cardsPositionPerRoomScale);
  }
}

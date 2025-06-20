import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragPreview, CdkDragStart, DragRef, Point } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, HostListener, inject, input, InputSignal, QueryList, Signal, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mergeMap } from 'rxjs';
import { clamp, Coordinates, Dimensions, getScaledItemRenderDimensions } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { snapToGridCellCentre, snapToGridNearestVertex } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { CardPositionPerRoomApiService } from '../../services/card-game-core/api/card-position-per-room-api.service';
import { CardComponent } from '../card/card.component';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../utils/card-face.constants';
import { CardFaceImage } from '../../utils/card-face.utils';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag, CdkDragPreview,
    CardComponent, ActionContextMenuComponent, CommonModule
  ],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.css'
})
export class CardPositionPerRoomComponent {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private dndBoardService: DndBoardService = inject(DndBoardService);
  private gameRoomService: GameRoomService = inject(GameRoomService);
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
   
  readonly cardDragPreviewPlaceholder: CardFaceImage = getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_DIMENSIONS);

  private el = inject(ElementRef);

  cprs: CardPositionPerRoom[] = [];

  shouldSnapToGrid: InputSignal<boolean> = input(false);
  shouldSnapToGridComputed: Signal<boolean> = computed(() => this.shouldSnapToGrid());

  @ViewChildren('cardsPositionPerRoom') cardsPositionPerRoomRef!: QueryList<ElementRef<HTMLDivElement>>;

  // NOTE: For rendering only
  unculledCprs: CardPositionPerRoom[] = [];
 private overlappedCprs: Map<string, CardPositionPerRoom[]> = new Map();

  // TODO: Refactor the bloody architecture
  cardsPositionPerRoomScale: number = 1;
  
  private dragOffset: Coordinates = {x: 0, y: 0};

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };
  
  currentContentMenuCpr: CardPositionPerRoom | undefined = undefined;
  
  private readonly MAX_ROTATION_DEGREE: number = 360;
  
  private get maxZIndex() {
    return  Math.max(...this.cprs.map(
            e => e.zIndex))
  }

  // TODO: Replace screen position cache with just a style cache
  private screenPositionCache = new Map<string, Coordinates>();

  getCardScreenPosition(cpr: CardPositionPerRoom): Coordinates {
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
  private _cprActionContextMenuItems: ActionContextMenuItem[] = [
    {
      id: 0,
      name: 'Flip',
      action: (cpr?: CardPositionPerRoom) => {
        if (!cpr) return;
        cpr.card = {
          ...cpr.card,
          currentCardFaceIndex: (cpr.card.currentCardFaceIndex === 0) ? 1 : 0
        };
      },
      disabled: false
    },
    {
      id: 1,
      name: 'Rotate Left',
      action: (cpr?: CardPositionPerRoom) => {
        if (!cpr) return;
        this.rotateCardPositionPerRoom(-45, cpr);
      },
      disabled: false
    },
    {
      id: 2,
      name: 'Rotate Right',
      action: (cpr?: CardPositionPerRoom) => {
        if (!cpr) return;
        this.rotateCardPositionPerRoom(45, cpr);
      },
      disabled: false
    },
    {
      id: 3,
      name: 'Edit Card',
      action: (cpr?: CardPositionPerRoom) => {
        if (!cpr) return;
        this.cardEditorPreviewService.getCardEditorCardDtoByCardId(cpr.card.cardId);
        this.cardGameCoreService.setIsCardEditorOpen(!this.cardGameCoreService.isCardEditorOpen());
      },
      disabled: false
    },
    {
      id: 4,
      name: 'Delete Card',
      action: (cpr?: CardPositionPerRoom) => {
        if (!cpr || cpr.card.cardId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId) return;
        this.screenPositionCache.delete(cpr.cardPositionPerRoomId);
        this.cardEditorPreviewService.deleteCard(cpr.card.cardId);
      },
      disabled: false
    }
  ]
  
  get cprActionContextMenuItems(): ActionContextMenuItem[] {
    return this._cprActionContextMenuItems;
  }

  rotateCardPositionPerRoom(degrees: number, cpr: CardPositionPerRoom) {
    if (!cpr) return;
    cpr.dndRotation.degrees = clamp(cpr.dndRotation.degrees + degrees, -this.MAX_ROTATION_DEGREE, this.MAX_ROTATION_DEGREE);
  }

  constructor() {
   // this.updateGridSize();

    this.onUpdateCardEditorCardDto();
    this.onDeleteCardEditorCardDto();

    this.onShowAllItems();

    effect(() => {
      if (parseFloat(this.gameRoomService.currentGameRoomId()) > 0) {
        this.getCardsPositionPerRoomByRoomId(this.gameRoomService.currentGameRoomId());
      }
    });
  }

  ngOnInit() {
    this.createCardPositionPerRoom();
    this.updateCardPositionPerRoomOnSave();
    
    this.onUpdateCamera();
    this.onMouseMove();
    this.setCardsZoomLevel();
    
    this.setOnScreenCprs();
  }

 private onUpdateCamera() {
    this.dndBoardService.onUpdateCamera$.subscribe(() => {
      this.updateCardsPositionPerRoom(this.unculledCprs);
      
      this.screenPositionCache.clear();
      this.setOnScreenCprs();
    })
  }


  // TODO: Make an observable that filters out all items not in camera viewport
  // Have a function to replace cprs and then render them
  private setOnScreenCprs(): void {
    if (this.cprs.length > 0) {
      this.unculledCprs = this.getOnScreenCprs(this.dndBoardService.getViewportDimensions());
      // console.log(`Card position per room set on screen CPRs: ${JSON.stringify(this.unculledCprs)}`);
    }
  }

  getOnScreenCprs(screen: Dimensions) {
    return this.cprs.filter(cpr => this.dndBoardService.isPositionInCameraSpace({x: cpr.dndPosition.x, y: cpr.dndPosition.y}, screen) == true);
  }

  // NOTE: Assumes the dndPosition is in AU and set to the mouse AU coordinates
  calculateScreenPosition(aU: Coordinates): Coordinates {
    return this.dndBoardService.aUToScreenCoordinates(aU);
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: {mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}) => {
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

  private findCardPositionPerRoom(cardId: string): CardPositionPerRoom | undefined{
    return this.cprs.find((cpr) => cpr.card.cardId == cardId);
  }

  // 50830.3 * 50 * 1 = 2,541,515
  private createCardPositionPerRoom() { 
    this.cardGameCoreService.cardPositionPerRoom$
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

  private updateCardsPositionPerRoom(cprs: CardPositionPerRoom[])
  {
    cprs.forEach((cpr: CardPositionPerRoom) => {
      this.updateCardPositionPerRoom(cpr);
    })
  }

  private updateCardPositionPerRoom(updatedCpr: CardPositionPerRoom) {
    let cprToReplace = this.findCardPositionPerRoom(updatedCpr.card.cardId);

    if (cprToReplace !== undefined) {
      // TODO: Get rid of this whole function
      // console.log(`Cpr to replace: ${JSON.stringify(cprToReplace)}, Updated CPR: ${JSON.stringify(updatedCpr)}`);
      
      Object.assign(cprToReplace, updatedCpr);

      // Force unculled refresh
      this.refreshUnculledCprs();
    }
  }
  
  private refreshUnculledCprs() {
    let dimensions = this.dndBoardService.getViewportDimensions();
    this.unculledCprs = this.getOnScreenCprs(dimensions);
  }

  private updateCardPositionPerRoomOnSave() {
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

   private onUpdateCardEditorCardDto() {
      // ASSUMPTION:
      // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
      // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
      this.cardEditorPreviewService.onUpdateCardEditorCardDto$
        .pipe(takeUntilDestroyed())
        .subscribe((cardEditorCardDto: CardEditorCardDto) => {
        if (cardEditorCardDto) {
          let index = this.cprs.findIndex(cpr => cpr.card.cardId === cardEditorCardDto.card.cardId);
  
          if (index !== -1) {
            this.cprs[index].card = cardEditorCardDto.card;
          }
        }
      });
    }

  private onDeleteCardEditorCardDto() {
    this.cardEditorPreviewService.onDeleteCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardId: string) => {
        this.unculledCprs = this.unculledCprs.filter(cpr => cpr.card.cardId !== cardId);

        // Again, this is in case if the user scrolls away from the current card being deleted, for instance
        this.cprs = this.cprs.filter(cpr => cpr.card.cardId !== cardId);

        // Reset the counter to prevent integer overflow
        if (this.cprs.length <= 0) 
          this.dndBoardService.globalZIndexCounter = 0;
      });
  }

  // NOTE: Drag offset will always be in AU
  setDragOffset(mouseAUCoordinates: Coordinates, dndPosition: DndPosition) {
    this.dragOffset = {
      x: mouseAUCoordinates.x - dndPosition.x,
      y: mouseAUCoordinates.y - dndPosition.y
    };
  }
  
  // NOTE Don't ever set the positioning, preview's not absolutely positioned
  setPreviewTransform(id: string, translation: Coordinates,rotation: number) {
    let preview: HTMLElement | null = document.querySelector(
      `[cpr-cdk-drag-preview-id="${id}"]`
    ) as HTMLElement | null;

    if (!preview)
      throw new Error("Preview doesn't exist, which means two things, we're passing the wrong id, or we're getting a nonexistent ID somehow");

    preview.style.transform = `translate3d(${translation.x}px, ${translation.y}px, 0) rotate(${rotation}deg)`;
  }

  onDragStarted(event: CdkDragStart<any>, item: CardPositionPerRoom) {
    // NOTE: By this point there should already be a cached position of the cpr
    let position: Coordinates | undefined = this.screenPositionCache.get(item.cardPositionPerRoomId);

    if (!position)
      throw new Error("By this point there should already be a cached position of the cpr");

    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.setDragOffset(this.dndBoardService.mouseAUCoordinates, item.dndPosition);

    /*let offset: Coordinates = this.calculateScreenPosition(this.dragOffset);

    let final: Coordinates = {
      x: position.x - offset.x,
      y: position.y - offset.y
    };*/

    // NOTE: By this point there should already be a cached position of the cpr
    // ASSUMPTION: When you start dragging, the item shouldn't be culled
    this.setPreviewTransform(item.cardPositionPerRoomId, position, item.dndRotation.degrees);

    let attributes = this.getCardPositionPerRoomOverlappingAttributes(item);
  }

  getDragMovedOffset(mouseAUCoordinates: Coordinates, dragOffset: Coordinates): Coordinates {
    let aU: Coordinates = this.calculateAbsolutePosition(mouseAUCoordinates, dragOffset);
    let screen: Coordinates = this.dndBoardService.aUToScreenCoordinates(aU);

    return screen;
  }

  onDragMoved(event: CdkDragMove, item: CardPositionPerRoom): void {
    // WORKAROUND: We'll programmatically set the custom preview's transform, we just need to make sure that we set it on drag start too
    // They all have IDs, it should be apossible to grab them
    this.setPreviewTransform(item.cardPositionPerRoomId, this.getDragMovedOffset(this.dndBoardService.mouseAUCoordinates, this.dragOffset), item.dndRotation.degrees);

    // TODO: If snap to grid, then run snap to grid else do what we have currently
    if (this.shouldSnapToGridComputed()) {

    }
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: CardPositionPerRoom) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently
    let snapToGrid: boolean = true;

    item.zIndex = this.dndBoardService.globalZIndexCounter++;
    this.setCardPerRoomPosition(item, this.dndBoardService.mouseAUCoordinates, this.dragOffset);


    // If it's overlapping another item
    let attributes = this.getCardPositionPerRoomOverlappingAttributes(item);
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

    if (this.shouldSnapToGridComputed()) {
     onScreenPosition = this.snapToGrid(this.dndBoardService.getScaledDndBoardSizeScreen(), onScreenPosition); 
    }

    this.screenPositionCache.set(cpr.cardPositionPerRoomId, onScreenPosition);

    // CHECKME: Problem is, with that approach my concern is
    // In the edge case where you drag the item off screen, and the viewport scrolls, what then
    // Wouldn't the position be wrong
    // this.screenPositionCache.delete(cpr.cardPositionPerRoomId);
  }

  getCardPositionPerRoomOverlappingAttributes(item: CardPositionPerRoom): {
    coordinates: Coordinates;
    dimensions: Dimensions;
} {
    let coordinates: Coordinates = {
      x: item.dndPosition.x,
      y: item.dndPosition.y
    };

    let rect: DOMRect | null = this.getCardPositionPerRoomRectById(item.cardPositionPerRoomId);

    if (!rect)
      throw new Error("Card position per room can't get back its own width and height!?");

    let dimensions: Dimensions = {
      width: rect.width,
      height: rect.height
    };

    return {
      coordinates,
      dimensions
    };
  }

  addOverlappedCpr(currentCpirId: string, cpr: CardPositionPerRoom) {
    let overlapped: CardPositionPerRoom[] | undefined = this.overlappedCprs.get(currentCpirId);

    if (overlapped) {
      overlapped.push(cpr);
      return;
    }
    
    this.overlappedCprs.set(currentCpirId, [cpr]);
  }

  cullOverlappedItems(currentCprId: string, coordinates: Coordinates, dimensions: Dimensions) {
    let toCull: Set<string> = new Set();

    this.unculledCprs.forEach((cpr: CardPositionPerRoom) => {
      if (cpr.cardPositionPerRoomId === currentCprId) {
        // Skip the card being moved
        return;
      }
      
      // TODO: Probably refactor this out of here
      /****************************************************************** */
      let attributes = this.getCardPositionPerRoomOverlappingAttributes(cpr);

      if (this.isRectContainedIn(
        {
          coordinates: attributes.coordinates,
          dimensions: attributes.dimensions
        },
        {
          coordinates: coordinates,
          dimensions: dimensions
        }
      )) {
        // FIXME: Why is it not actually culling these cards
        this.addOverlappedCpr(currentCprId, cpr);
        toCull.add(cpr.cardPositionPerRoomId);
        return;
      }
    })

    this.unculledCprs = this.unculledCprs.filter(
      c => !toCull.has(c.cardPositionPerRoomId)
    );
  }

  // FIXME: Why is it not culling correctly, etc.
  isRectContainedIn(
    innerRect: { coordinates: Coordinates, dimensions: Dimensions },
    outerRect: { coordinates: Coordinates, dimensions: Dimensions }
  ): boolean {
    return (
      innerRect.coordinates.x >= outerRect.coordinates.x &&
      innerRect.coordinates.x + innerRect.dimensions.width <= outerRect.coordinates.x + outerRect.dimensions.width &&
      innerRect.coordinates.y >= outerRect.coordinates.y &&
      innerRect.coordinates.y + innerRect.dimensions.height <= outerRect.coordinates.y + outerRect.dimensions.height
    );
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


  // TODO: Refactor this, this is temporary overlap check
  // Here's the thing, what we actually really need is the precise size
  // Of the card itself, it would just be better to have it so that
  // If there's an overlap, we just 'hide the card', aka cull it
  // Especially since there's multiple cards that can be stacked on each other
  // Does that mean the z-index is unnecessary, I mean what we  can do is just
  // Have a z-index of -1, if indeed it is negative 1, don't render it?
  // That means that whenever the card moves, the overlapped card (-1) would have to shift up at least 1 index
  
  /******************** PARTIAL OVERLAP*************************/
  getOverlappingItemsBoundary(coordinate: Coordinates, distance: number) {
    return {
      left: coordinate.x - distance,
      right: coordinate.x + distance,
      top: coordinate.y - distance,
      bottom: coordinate.y + distance
    }
  }

  isInBoundary(
    coordinate: { x: number; y: number },
    boundary: { left: number; right: number; top: number; bottom: number }
  ): boolean {
    return (
      coordinate.x >= boundary.left &&
      coordinate.x <= boundary.right &&
      coordinate.y >= boundary.top &&
      coordinate.y <= boundary.bottom
    );
  }

 isPartialOverlap(
  rect1: { coordinates: Coordinates, dimensions: Dimensions },
  rect2: { coordinates: Coordinates, dimensions: Dimensions }
): boolean {
  return (
    rect1.coordinates.x < rect2.coordinates.x + rect2.dimensions.width &&
    rect1.coordinates.x + rect1.dimensions.width > rect2.coordinates.x &&
    rect1.coordinates.y < rect2.coordinates.y + rect2.dimensions.height &&
    rect1.coordinates.y + rect1.dimensions.height > rect2.coordinates.y
  );
}

  getCardPositionPerRoomRectById(cardPositionPerRoomId: string): DOMRect | null {
    let element: ElementRef<HTMLDivElement> | undefined = this.cardsPositionPerRoomRef.find(ref =>
      ref.nativeElement.getAttribute('card-position-per-room-id') === cardPositionPerRoomId
    );

    return element ? element.nativeElement.getBoundingClientRect() : null;
  }

  private snapToGrid(gridSize: number, coordinates: Coordinates): Coordinates {
    return snapToGridNearestVertex(gridSize, coordinates);
  }

  // https://stackoverflow.com/a/69324787
  // FIXME: Only works with standalone drags
  computeDragRenderPos(userPointerPosition: Point, dragRef: DragRef, dimensions: DOMRect, pickupPositionInElement: Point) {
    let gridSize: number = 50; 
    let { offsetX, offsetY } = snapToGridCellCentre(gridSize, userPointerPosition.x, userPointerPosition.y);

    // console.log(`Offset computeDragRenderPos: ${JSON.stringify({offsetX, offsetY})}`);

    return { x: offsetX, y: offsetY };
  }

  onCardRightClick(event: MouseEvent, cardId: string): void {
    event.preventDefault();
    
    // Get the parent element and its bounding rect
    let parentElement: HTMLElement | null = this.el.nativeElement.parentElement;
    if (!parentElement) return; 

    let parentRect: DOMRect = parentElement.getBoundingClientRect();

    // Calculate menu position relative to parent
    this.contextMenuPosition = {
      x: event.clientX - parentRect.left,
      y:event.clientY - parentRect.top
    }
  
    let potentialCurrentContextMenuCpr: CardPositionPerRoom | undefined= this.findCardPositionPerRoom(cardId);

    if (!potentialCurrentContextMenuCpr)
      throw new Error("Current context menu CPR is undefined");

    this.currentContentMenuCpr = potentialCurrentContextMenuCpr;
    this.setDisableContextMenuItems(this.currentContentMenuCpr);
  }

  setDisableContextMenuItems(currentContextMenuCpr: CardPositionPerRoom) {
    this._cprActionContextMenuItems[1].disabled = currentContextMenuCpr?.dndItem.isRotatable === false ||
      (currentContextMenuCpr?.dndRotation?.degrees ?? 0) <= -this.MAX_ROTATION_DEGREE;

    this._cprActionContextMenuItems[2].disabled = currentContextMenuCpr?.dndItem.isRotatable === false ||
      (currentContextMenuCpr?.dndRotation?.degrees ?? 0) >= this.MAX_ROTATION_DEGREE;

    this._cprActionContextMenuItems[4].disabled = (currentContextMenuCpr?.card.cardId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId);
  }

  @HostListener('document:click')
  documentClick(): void {
    this.currentContentMenuCpr = undefined;
  }

  getRightClickMenuStyle() {
    return {
      position: 'absolute',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`,
      zIndex: this.dndBoardService.globalZIndexCounter // FIXED: Context menu can be behind the item that it's clicked on
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    item.action(this.currentContentMenuCpr);
  }

  // TODO: Refactor this as we're probably going to have more items than just cards
  onShowAllItems() {
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

  getCardDragPreviewPlaceholderDimensions(): Dimensions {
    return getScaledItemRenderDimensions(this.cardDragPreviewPlaceholder.dimensions, this.cardsPositionPerRoomScale);
  }
}

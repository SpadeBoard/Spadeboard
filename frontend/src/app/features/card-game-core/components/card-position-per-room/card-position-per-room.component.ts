import { AfterViewInit, Component, effect, ElementRef, HostListener, inject, Injectable, input, QueryList, ViewChild, ViewChildren  } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../services/card-game-core/card-position-per-room-api.service';
import { Card, CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragStart, DragRef, Point} from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card.component';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { mergeMap } from 'rxjs';
import { snapToGridCellCentre, snapToGridNearestVertex } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { CommonModule } from '@angular/common';
import { clamp, Coordinates, Dimensions, moveToBack } from '../../../../utils/utils';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
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
   
  private el = inject(ElementRef);

  cprs: CardPositionPerRoom[] = [];

  @ViewChildren('cardsPositionPerRoom') cardsPositionPerRoomRef!: QueryList<ElementRef<HTMLDivElement>>;

  // NOTE: For rendering only
  unculledCprs: CardPositionPerRoom[] = [];
 private overlappedCprs: Map<string, CardPositionPerRoom[]> = new Map();

  private snapToGridPosition: {x: number, y: number} = {x: 0, y: 0};
  
  // TODO: Refactor the bloody architecture
  cardsPositionPerRoomScale: number = 1;
  
  private dragOffset: { x: number; y: number; } = {x: 0, y: 0};

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };
  
  currentContentMenuCpr: CardPositionPerRoom | undefined = undefined;
  
  private get maxZIndex() {
    return  Math.max(...this.cprs.map(
            e => e.zIndex))
  }

  // NOTE: Reset it when there's no more cards in the room
  // Reset the global zIndex counter only if you anticipate integer overflow, 
  // performance issues, 
  // or want to keep your zIndex values manageable for debugging and maintenance

  // TODO: Pass in the cpr here as a parameter to determine whether you can rotate?
  get actionContextMenuItems(): ActionContextMenuItem[] {
    return [
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

          cpr.dndRotation = {
            ...cpr.dndRotation,
            degrees: clamp(cpr.dndRotation.degrees -= 45, -360, 360)
          }

        },
       disabled: this.currentContentMenuCpr?.dndItem.isRotatable === false ||
                        (this.currentContentMenuCpr?.dndRotation?.degrees ?? 0) <= -360
      },
      {
        id: 2,
        name: 'Rotate Right',
        action: (cpr?: CardPositionPerRoom) => {
          if (!cpr) return;

          cpr.dndRotation = {
            ...cpr.dndRotation,
            degrees: clamp(cpr.dndRotation.degrees += 45, -360, 360)
          }
        },
        disabled: this.currentContentMenuCpr?.dndItem.isRotatable === false ||
          (this.currentContentMenuCpr?.dndRotation?.degrees ?? 0) >= 360
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
          this.cardEditorPreviewService.deleteCard(cpr.card.cardId);
        },
        disabled: ((this.currentContentMenuCpr?.card.cardId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId)) ? true: false
      }
    ];
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
  calculateCardPositionPerRoomScreenPosition(dndPositionAU: DndPosition): Coordinates {
    let cprScreenCoordinates = this.dndBoardService.aUToScreenCoordinates({x: dndPositionAU.x, y: dndPositionAU.y});

    // console.log(`Calculate CPR screen position - AU coordinates: ${JSON.stringify(dndPositionAU)}, Screen coordinates: ${JSON.stringify(cprScreenCoordinates)}`);

    return cprScreenCoordinates;
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: {mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}) => {
      let mouseMoveLog = `Card position per room - On Mouse Move:
      Mouse Screen coordinates (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
      Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.getMouseAUCoordinates())})
      Mouse AU to Screen coordinates: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.getMouseAUCoordinates()))})
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
        this.cardsPositionPerRoomScale = itemRenderScale;
      }
    })
  }
  
  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  private getCardsPositionPerRoomByRoomId(gameRoomId: string): void {
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined) {
          this.cprs = result;
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
        }
      });
    });
  }

   private onUpdateCardEditorCardDto() {
      // ASSUMPTION:
      // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
      // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
      this.cardGameCoreService.onUpdateCardEditorCardDto$
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

    private sortOrder() {
      this.cprs.forEach((cpr: CardPositionPerRoom) => {
        cpr.zIndex = cpr.zIndex - (cpr.zIndex - this.cprs.length); // Again, this is to make sure it's all relative, you're always going to get the same exact difference
      })
    }

  private onDeleteCardEditorCardDto() {
    this.cardGameCoreService.onDeleteCardEditorCardDto$
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

  private restoreOverlappedCards(currentCprId: string, coordinates: Coordinates, dimensions: Dimensions): void {
    // NOTE: Just to make sure since we're 
    let overlapped: CardPositionPerRoom[] | undefined = this.overlappedCprs.get(currentCprId);

    if (!overlapped)
      return;

    let isUnculled: boolean = false;

    overlapped.forEach((cpr: CardPositionPerRoom,) => {
      let attributes = this.getCardPositionPerRoomOverlappingAttributes(cpr);

      if (!this.isRectContainedIn(
        {
          coordinates: attributes.coordinates,
          dimensions: attributes.dimensions
        },
        {
          coordinates: coordinates,
          dimensions: dimensions
        }
      ))
        return;

      // TODO: We need to uncull this whenever you move the card    
      this.unculledCprs.push(cpr);
      isUnculled = true;
    });

    if (isUnculled)
      this.overlappedCprs.delete(currentCprId);
  }

  onDragStarted(event: CdkDragStart<any>, item: CardPositionPerRoom) {
    let mouseAU = this.dndBoardService.getMouseAUCoordinates();
    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.dragOffset = {
      x: mouseAU.x - item.dndPosition.x,
      y: mouseAU.y - item.dndPosition.y
    };

    let attributes = this.getCardPositionPerRoomOverlappingAttributes(item);
    // NOTE: Maintain the stacking order
    // this.raiseOverlappedItems(item.cardPositionPerRoomId, attributes.coordinates, attributes.dimensions);
    // this.restoreOverlappedCards(item.cardPositionPerRoomId, attributes.coordinates, attributes.dimensions); // Necessary order otherwise it'll raise the restored overlapped card's z-index
  }

  onDragMoved(event: CdkDragMove) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently

   // const element = event.source.element.nativeElement; // Get the draggable element's DOM node

   let snapToGrid: boolean = true;
    
   /* 
   This matches your expected input.

      Coordinate Math
      Your function subtracts the board's bounding rect (rect.left, rect.top) from the pointer position, then adds scroll, then converts to AU.

      This is the correct approach if your board is scrolled and zoomed, and your camera is managed via scroll position (not a separate camera variable).

      Caveats
      Make sure dndBoardElement is the actual scrollable board element.

      If your camera is managed by scroll, do not add cameraX/cameraY elsewhere in the conversion.

      If you programmatically pan (not just scroll), you may need to adjust your math as previously discussed.

      Summary Table
      Usage Scenario	Will it work?	Notes
      Board scrolls to pan	Yes	Your function is correct.
      Board pans programmatically (cameraX/Y)	Only if you adjust math	You must factor in cameraX/Y instead of scrollLeft/scrollTop.
   */

    if (snapToGrid) {
    let mouseMoveLog: string = `On Drag Moved:
     Mouse Screen coordinates: (${event.pointerPosition.x}, ${event.pointerPosition.y})
     Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.getMouseAUCoordinates())})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Camera coordinates AU: (${JSON.stringify(this.dndBoardService.getCameraCoordinates())})
     Zoom Level: ${this.dndBoardService.zoom}
     Scaled cell size screen: ${this.dndBoardService.getScaledCellSize()}`;

      // 3. Log everything
      // console.log(mouseMoveLog);
      // this.dndBoardService.updateMouseAUCoordinatesFromScreen(event.pointerPosition.x, event.pointerPosition.y, this.dndBoard.nativeElement);
      
      // this.setDndBoardMousePosition(event.pointerPosition.x, event.pointerPosition.y);
      // console.log(`On drag move card position per room before snap: ${JSON.stringify(event.pointerPosition)}`);
      /*let cellSizeScreen = this.dndBoardService.getScaledCellSize();
      
      // event.pointerPosition = this.snapToGrid(cellSizeScreen, event.pointerPosition);
     let mouseScreenCoordinates = this.dndBoardService.getMouseScreenCoordinates();
     this.snapToGridPosition = this.snapToGrid(cellSizeScreen, {x: mouseScreenCoordinates.screenX, y: mouseScreenCoordinates.screenY});
      */
     // this.snapToGridPosition = this.snapToGrid(cellSizeScreen, event.pointerPosition);
      // console.log(`On drag move card position per room after snap: ${JSON.stringify(event.pointerPosition)}`);
    } 
  }

  /* 
  Based on your code and the search results, yes, this is likely occurring because the camera's viewport bounds are being updated during interactions while items are being positioned. Here's the breakdown:

Key Reasons for Disappearing Items
Camera Boundary Checks
Your isPositionInCameraSpace() filters items based on current camera bounds. If camera coordinates update mid-drag or due to scroll/zoom events, items might temporarily fall outside the visible area.

Drag Preview Rendering
Angular's CDK drag creates a preview element during drag operations. If your camera calculations affect this preview's position or visibility, it might appear to vanish.

Coordinate System Mismatch
The updateMouseAUCoordinatesFromScreen() method converts screen to AU coordinates without clamping, but isPositionInCameraSpace uses clamped camera bounds. A dragged item's calculated position could briefly exist outside clamped camera bounds.
  */

  onDragDrop(event: CdkDragDrop<any[]>, item: CardPositionPerRoom) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently
    let snapToGrid: boolean = true;

    // item.dndPosition = snapToGrid ? this.snapToGridPosition: {x: event.dropPoint.x, y: event.dropPoint.y};
    let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();

    // Can't use auToScreenCoordinates in this case because mouse position is offsetted

    item.dndPosition = {
      dndPositionId: item.dndPosition.dndPositionId,
      x: mouseAUCoordinates.x - this.dragOffset.x,
      y: mouseAUCoordinates.y - this.dragOffset.y
    };

    let mouseMoveLog: string = `On Drag Dropped:
     Mouse coordinates relative to viewport: (${event.dropPoint.x}, ${event.dropPoint.y})
     Mouse AU coordinates: (${JSON.stringify(mouseAUCoordinates)})
     Mouse AU to Screen coordinates - relative to board : (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(mouseAUCoordinates))})
     Dnd Position: (${JSON.stringify(item.dndPosition)})
     Viewport dimensions: (${JSON.stringify(this.dndBoardService.getViewportDimensions())})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Zoom Level: ${this.dndBoardService.zoom}
     Scaled cell size screen: ${this.dndBoardService.getScaledCellSize()}`;

    // 3. Log everything
    // console.log(mouseMoveLog);

    // item.dndPosition = {x: event.dropPoint.x, y: event.dropPoint.y};
    // console.log(`On drag drop card position per room: ${JSON.stringify(item.dndPosition)}`);

    // console.log(`On drag drop: AU - ${JSON.stringify(item.dndPosition)}), Screen PX - ${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(item.dndPosition.x, item.dndPosition.y))}`);


    // If it's overlapping another item
    let attributes = this.getCardPositionPerRoomOverlappingAttributes(item);
    // this.cullOverlappedItems(item.cardPositionPerRoomId, attributes.coordinates, attributes.dimensions));

    /*if (this.lowerOverlappedItems(item.cardPositionPerRoomId, attributes.coordinates, attributes.dimensions)) {
      item.zIndex = clamp(this.maxZIndex + 1, 0, this.cprs.length); // We only want to raise the z Index if there is actual overlapping, otherwise what's the point
    }*/

    item.zIndex = this.dndBoardService.globalZIndexCounter++;

    this.updateCardPositionPerRoom(item);
  }

  // The reason why this exists is that if we place the item on the same area over 
  // And over again, the overlapped items don't keep shifting down
  // Because eventually they would all hit 0th index
  // We need to keep the stacking order
  raiseOverlappedItems(currentCprId: string, coordinates: Coordinates, dimensions: Dimensions): boolean {
    let hasRaisedOverlappedItems: boolean = false;

    // CHECKME: Do we want unculled or all
    this.unculledCprs.forEach((cpr: CardPositionPerRoom) => {
      if (cpr.cardPositionPerRoomId === currentCprId) {
        // Skip the card being moved
        return;
      }
  
      let attributes = this.getCardPositionPerRoomOverlappingAttributes(cpr);

      if (!this.isPartialOverlap(
        {
          coordinates: coordinates,
          dimensions: dimensions
        },
        {
          coordinates: attributes.coordinates,
          dimensions: attributes.dimensions
        }
      )) {
        return
      }

      // CHECKME: If there's multiple items of the same z index, is this going to be an issue
      // We need to do this to update the main cpr list
      cpr.zIndex = clamp(cpr.zIndex + 1, 0, this.cprs.length);
      this.updateCardPositionPerRoom(cpr);
      hasRaisedOverlappedItems = true;
    })

    return hasRaisedOverlappedItems;
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

  lowerOverlappedItems(currentCprId: string, coordinates: Coordinates, dimensions: Dimensions): boolean {
    let hasLoweredOverlappedItems: boolean = false;
    let toCull: Set<string> = new Set();

    // CHECKME: Do we want unculled or all
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
        // TODO: We need to uncull this whenever you move the card
        this.addOverlappedCpr(currentCprId, cpr);
        toCull.add(cpr.cardPositionPerRoomId);
        return;
      }
      /********************************************************/

      if (!this.isPartialOverlap(
        {
          coordinates: coordinates,
          dimensions: dimensions
        },
        {
          coordinates: attributes.coordinates,
          dimensions: attributes.dimensions
        }
      )) {
        return;
      }

      // CHECKME: If there's multiple items of the same z index, is this going to be an issue
      // We need to do this to update the main cpr list
      cpr.zIndex = clamp(cpr.zIndex - 1, 0, this.cprs.length);
      this.updateCardPositionPerRoom(cpr);
      hasLoweredOverlappedItems = true;
    })

    this.unculledCprs = this.unculledCprs.filter(
      c => !toCull.has(c.cardPositionPerRoomId)
    );

    return hasLoweredOverlappedItems;
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

  snapToGrid(gridSize: number, userPointerPosition: Point)
  {
    let { offsetX, offsetY } = snapToGridNearestVertex(gridSize, userPointerPosition.x, userPointerPosition.y);

    // console.log(`Offset snapToGrid: ${JSON.stringify({offsetX, offsetY})}`);

    return { x: offsetX, y: offsetY };
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
  }

  @HostListener('document:click')
  documentClick(): void {
    this.currentContentMenuCpr = undefined;
  }

  getRightClickMenuStyle() {
    return {
      position: 'absolute',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`
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
}

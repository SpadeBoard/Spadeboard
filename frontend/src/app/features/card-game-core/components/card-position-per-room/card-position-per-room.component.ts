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
import { isCardPositionPerRoom } from '../../utils/card-game-core.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { CommonModule } from '@angular/common';
import { Coordinates } from '../../../../utils/utils';

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

  private snapToGridPosition: {x: number, y: number} = {x: 0, y: 0};
  
  // TODO: Refactor the bloody architecture
  cardsPositionPerRoomScale: number = 1;
  
  private dragOffset: { x: number; y: number; } = {x: 0, y: 0};

  private rightClickMenuPositionX: number = 0;
  private rightClickMenuPositionY: number = 0;
  currentContextMenuId: string = "";

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
        }
      },
      {
        id: 1,
        name: 'Edit Card',
        action: (cpr?: CardPositionPerRoom) => {
          if (!cpr) return;
          this.cardEditorPreviewService.getCardEditorCardDtoByCardId(cpr.card.cardId);
          this.cardGameCoreService.setIsCardEditorOpen(!this.cardGameCoreService.isCardEditorOpen());
        }
      },
      {
        id: 2,
        name: (this.currentContextMenuId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId)
          ? "Can't delete - Being edited..."
          : 'Delete Card',
        action: (cpr?: CardPositionPerRoom) => {
          if (!cpr || cpr.card.cardId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId) return;
          this.cardEditorPreviewService.deleteCard(cpr.card.cardId);
        }
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
      let getViewportDimensions = this.dndBoardService.getViewportDimensions();

      let viewportWidth = getViewportDimensions.viewportWidthPx;
      let viewportHeight = getViewportDimensions.viewportHeightPx;

      this.unculledCprs = this.getOnScreenCprs(viewportWidth, viewportHeight);
      // console.log(`Card position per room set on screen CPRs: ${JSON.stringify(this.unculledCprs)}`);
    }
  }

  getOnScreenCprs(screenPxX: number, screenPxY: number) {
    return this.cprs.filter(cpr => this.dndBoardService.isPositionInCameraSpace(cpr.dndPosition.x, cpr.dndPosition.y, screenPxX, screenPxY) == true);
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
    this.unculledCprs = this.getOnScreenCprs(dimensions.viewportWidthPx, dimensions.viewportHeightPx);
  }

  private updateCardPositionPerRoomOnSave() {
    this.gameRoomService.onSaveGameRoom$.subscribe(() => {
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

  private onDeleteCardEditorCardDto() {
    this.cardGameCoreService.onDeleteCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardId: string) => {
        this.unculledCprs = this.unculledCprs.filter(cpr => cpr.card.cardId !== cardId);

        // Again, this is in case if the user scrolls away from the current card being deleted, for instance
        this.cprs = this.cprs.filter(cpr => cpr.card.cardId !== cardId);
      });
  }

  onDragStarted(event: CdkDragStart<any>, item: CardPositionPerRoom) {
    let mouseAU = this.dndBoardService.getMouseAUCoordinates();
    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.dragOffset = {
      x: mouseAU.x - item.dndPosition.x,
      y: mouseAU.y - item.dndPosition.y
    };
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

    this.updateCardPositionPerRoom(item);
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
    this.rightClickMenuPositionX = event.clientX - parentRect.left;
    this.rightClickMenuPositionY = event.clientY - parentRect.top;

    this.currentContextMenuId = cardId;
  }

  @HostListener('document:click')
  documentClick(): void {
    this.currentContextMenuId = "";
  }

  getRightClickMenuStyle() {
    return {
      position: 'absolute',
      left: `${this.rightClickMenuPositionX}px`,
      top: `${this.rightClickMenuPositionY}px`
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    let cpr: CardPositionPerRoom | undefined = this.findCardPositionPerRoom(this.currentContextMenuId);

    if (cpr)
      item.action(cpr);
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

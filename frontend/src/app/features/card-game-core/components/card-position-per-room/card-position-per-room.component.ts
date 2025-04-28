import { Component, effect, inject, Injectable, input  } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../services/card-game-core/card-position-per-room-api.service';
import { CardPositionPerRoom } from '../../models/card';
import { CdkDrag, CdkDragDrop, CdkDragMove, DragRef, Point} from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card.component';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { mergeMap } from 'rxjs';
import { snapToGridCellCentre, snapToGridNearestVertex } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { isCardPositionPerRoom } from '../../utils/card-game-core.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
    CardComponent
  ],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.css'
})
export class CardPositionPerRoomComponent {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private dndBoardService: DndBoardService = inject(DndBoardService);
  private gameRoomService: GameRoomService = inject(GameRoomService);

  cprs: CardPositionPerRoom[] = [];

  private snapToGridPosition: {x: number, y: number} = {x: 0, y: 0};
  
  cardsZoomLevel: number = 1;

  constructor() {
    effect(() => {
      if (this.gameRoomService.currentGameRoomId() > 0) {
        this.getCardsPositionPerRoomByRoomId(this.gameRoomService.currentGameRoomId());
      }
    });
  }

  ngOnInit() {
    this.createCardPositionPerRoom();
    this.updateCardPositionPerRoomOnSave();
    this.setCardsZoomLevel();
  }

  private getCardPositionPerRoom() {
    this.cardGameCoreService.cardPositionPerRoomId$.subscribe((idx: number) => {
      
    });
  }

  private setCardsZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {
      this.cardsZoomLevel = zoomLevel;
    })
  }
  
  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  private getCardsPositionPerRoomByRoomId(gameRoomId: number): void {
    // TODO
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined)
          this.cprs = result;
    });
  }

  private findCardPositionPerRoom(cardId: number): CardPositionPerRoom | undefined{
    return this.cprs.find((cpr) => cpr.card.cardId == cardId);
  }

  private createCardPositionPerRoom() { 
    this.cardGameCoreService.cardPositionPerRoom$
      .pipe(
        mergeMap((cpr: CardPositionPerRoom) =>
          this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr)
        )
      )
      .subscribe((result: CardPositionPerRoom | undefined) => {
        if (result !== undefined) {
          this.cprs.push(result);
        }
      });
  }

  // TODO: Get the card via the ID as well as position
  // TODO: Create a new card position per room

  // TODO: Update to the backend based on idle period
  private updateCardPositionPerRoom(updatedCpr: CardPositionPerRoom) {
    let cprToReplace = this.findCardPositionPerRoom(updatedCpr.card.cardId);

    if (cprToReplace !== undefined) {
      Object.assign(cprToReplace, updatedCpr);
    }
  }

  private updateCardPositionPerRoomOnSave() {
    this.gameRoomService.onSaveGameRoom$.subscribe(() => {
      this.cardPositionPerRoomApiService.updateCardsPositionPerRoom(this.cprs).subscribe((cprs: CardPositionPerRoom[] | undefined) => {
        if (cprs !== undefined) {
          // console.log(`Updated CPRs on save: ${JSON.stringify(cprs)}`);
        }
      });
    });
  }

  private deleteCardPositionPerRoom(id: number) {
    // TODO: Delete from the bridge table
    this.cprs = this.cprs.filter(cpr => cpr.cardPositionPerRoomId !== id);

    // TODO: If it's the only reference in there, then delete the entire card from the database
    this.cardPositionPerRoomApiService.deleteCardPositionPerRoom(id);
  }

  onDragMoved(event: CdkDragMove) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently

   // const element = event.source.element.nativeElement; // Get the draggable element's DOM node

   let snapToGrid: boolean = true;
    
    if (snapToGrid) {
      // console.log(`On drag move card position per room before snap: ${JSON.stringify(event.pointerPosition)}`);
      let cellSizeScreen = this.dndBoardService.cellSizeScreen * this.dndBoardService.zoom;
      
      // event.pointerPosition = this.snapToGrid(cellSizeScreen, event.pointerPosition);
      this.snapToGridPosition = this.snapToGrid(cellSizeScreen, event.pointerPosition);
      // console.log(`On drag move card position per room after snap: ${JSON.stringify(event.pointerPosition)}`);
    } 
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: CardPositionPerRoom) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently
    let snapToGrid: boolean = true;

    item.dndPosition = snapToGrid ? this.snapToGridPosition: {x: event.dropPoint.x, y: event.dropPoint.y};
    // item.dndPosition = {x: event.dropPoint.x, y: event.dropPoint.y};
    // console.log(`On drag drop card position per room: ${JSON.stringify(item.dndPosition)}`);

    console.log(`Positioning of CPR: AU - ${JSON.stringify(this.dndBoardService.screenToAUCoordinates(item.dndPosition.x, item.dndPosition.y))}), Screen PX - ${JSON.stringify(item.dndPosition)}`);
    
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
}

import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Subscription, switchMap, tap } from 'rxjs';
import { Coordinates } from '../../../../../../utils/utils';
import { ActionContextMenuItem } from '../../../../../actions-context-menu/models/action-context-menu-item';
import { DndBoardService } from '../../../../../drag-and-drop/services/dnd-board.service';
import { snapToGridNearestVertex } from '../../../../../drag-and-drop/utils/coordinate-conversions.utils';
import { GameRoomService } from '../../../../../game-room/services/game-room.service';
import { CardPositionPerRoom } from '../../../../models/card';
import { CardPositionPerRoomApiService } from '../../api/card-position-per-room-api.service';
import { CardEditorOperationsService } from '../../card-editor/operations/card-editor-operations.service';
import { CardEditorPreviewService } from '../../card-editor/preview/card-editor-preview.service';
import { CardPositionPerRoomManipulationService } from '../manipulation/card-position-per-room-manipulation.service';

@Injectable({
  providedIn: 'root'
})
export class CardPositionPerRoomOperationsService {
  private readonly cardPositionPerRoomApiService: CardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);

  private readonly cardPositionPerRoomManipulationService: CardPositionPerRoomManipulationService = inject(CardPositionPerRoomManipulationService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);

  private readonly gameRoomService: GameRoomService = inject(GameRoomService);

  private readonly dndBoardService: DndBoardService = inject(DndBoardService);

  constructor() { }

  /******************* CONTEXT MENU **************************/
  private flipAction(cpr: CardPositionPerRoom): void {
    if (!cpr) return;

    cpr.card = {
      ...cpr.card,
      currentCardFaceIndex: (cpr.card.currentCardFaceIndex === 0) ? 1 : 0
    };
  }

  private rotateAction(cpr: CardPositionPerRoom, direction: 'l' | 'r' = 'r', degree: number = 45): void {
    if (!cpr) return;

    this.cardPositionPerRoomManipulationService.rotateCardPositionPerRoom(this.normalize(degree, direction), cpr);
  }

  // CHECKM:E Make this a utility function
  private normalize(degree: number, direction: 'l' | 'r'): number {
    return (direction === 'l' && degree > 0) || (direction === 'r' && degree < 0) ? degree * -1 : degree;
  }

  public getMenuItems(): ActionContextMenuItem[] {
    return [
      {
        id: 0,
        name: 'Flip',
        action: (cpr: CardPositionPerRoom) => this.flipAction(cpr),
        disabled: false
      },
      {
        id: 1,
        name: 'Rotate Left',
        action: (params: { cpr: CardPositionPerRoom, degrees?: number }) => {
          let { cpr, degrees } = params;

          this.rotateAction(cpr, 'l', degrees);
        },
        disabled: false
      },
      {
        id: 2,
        name: 'Rotate Right',
        action: (params: { cpr: CardPositionPerRoom, degrees?: number }) => {
          let { cpr, degrees } = params;

          this.rotateAction(cpr, 'r', degrees);
        },
        disabled: false
      },
      {
        id: 3,
        name: 'Edit Card',
        action: (params: { cpr: CardPositionPerRoom, cardEditorPreviewService: CardEditorPreviewService}) => {
          let { cpr, cardEditorPreviewService} = params;
          this.cardEditorOperationsService.editCardAction(cpr.card.cardId, cardEditorPreviewService);
        },
        disabled: false
      },
      {
        id: 4,
        name: 'Delete Card',
        action: (params: { cpr: CardPositionPerRoom, cardEditorPreviewService: CardEditorPreviewService, screenPositionCache: Map<string, Coordinates> }) => {
          let { cpr, cardEditorPreviewService, screenPositionCache } = params;

          screenPositionCache.delete(cpr.cardPositionPerRoomId);
          this.cardEditorOperationsService.deleteCardAction(cpr.card.cardId, cardEditorPreviewService);
        },
        disabled: false
      }
    ]
  }

  public setDisableContextMenuItems(menu: ActionContextMenuItem[], currentContextMenuCpr: CardPositionPerRoom): void {
    menu[1].disabled = !this.cardPositionPerRoomManipulationService.canRotate(currentContextMenuCpr, 'l');

    menu[2].disabled = !this.cardPositionPerRoomManipulationService.canRotate(currentContextMenuCpr, 'r');

    menu[4].disabled = !this.cardEditorOperationsService.canDeleteCard(currentContextMenuCpr.card.cardId);
  }
  /******************* CONTEXT MENU **************************/

  /***************************** OPERATIONS ***********************************/
  private updateOnSave(cprs: CardPositionPerRoom[], globalZIndexCounter: number): void {
    this.gameRoomService.onSaveGameRoom$.pipe(
      tap(() =>
        this.cardPositionPerRoomManipulationService.normalizeZIndexes(cprs, globalZIndexCounter)
      ),
      switchMap(() =>
        this.cardPositionPerRoomApiService.updateCardsPositionPerRoom(cprs)
      ),
      takeUntilDestroyed()
    ).subscribe((result: CardPositionPerRoom[] | undefined) => {
      if (result) {

      }
    })
  }
  /***************************** OPERATIONS ***********************************/

  // TODO: Modify onUpdateCamera to return stuff?
  // TODO: We need to refactor the dndBoardService, badly
  // TODO: Refactor this, this is slightly ridiculous looking
  public onDndBoardTransformations(dndBoardService: DndBoardService, dndBoardTransformations: Map<string, Function>): Subscription {
    return merge(
      dndBoardService.onUpdateCamera$.pipe(
        map(() => 'translation')
      ),
      dndBoardService.onMouseMove$.pipe(
        map(() => 'translation')
      ),
      dndBoardService.zoomLevel$.pipe(
        map((lvl: number) => 'scale')
      )
    )
    .pipe(
      takeUntilDestroyed()
    )
    .subscribe((transformation: string) => {
      switch(transformation) {
        case 'scale': {
          
          break;
        }
      }
    });
  }


  /************************ CACHING ***************************/
  /************************ DND ***************************/
  // NOTE: Assumes the dndPosition is in AU and set to the mouse AU coordinates
  public calculateScreenPosition(au: Coordinates, dndBoardService: DndBoardService): Coordinates {
    return dndBoardService.aUToScreenCoordinates(au);
  }

  public calculateAbsolutePosition(au: Coordinates, dragOffset: Coordinates): Coordinates {
    return {
      x: au.x - dragOffset.x,
      y: au.y - dragOffset.y
    }
  }
  /************************ DND ***************************/

  public getCardScreenPosition(cpr: CardPositionPerRoom, screenPositionCache: Map<string, Coordinates>): Coordinates {
    let key: string = cpr.cardPositionPerRoomId;

    let pos: Coordinates | undefined = screenPositionCache.get(key);

    if (pos) return pos;

    let aU: Coordinates = {
      x: cpr.dndPosition.x,
      y: cpr.dndPosition.y
    }

    pos = this.calculateScreenPosition(aU, this.dndBoardService);

    if (!pos) throw new Error("No position for screen position cache");

    screenPositionCache.set(key, pos);

    return pos;
  }

  /************************ CACHING ***************************/

  public snapToGrid(cellSize: number, coordinates: Coordinates): Coordinates {
    return snapToGridNearestVertex(cellSize, coordinates);
  }

  /***************************************************************/
  public getCpr(cardId: string,cprs: CardPositionPerRoom[]): CardPositionPerRoom | undefined {
    return cprs.find((cpr) => cpr.card.cardId == cardId);
  }
}
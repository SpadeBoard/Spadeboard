import { Component, effect, inject, model, ModelSignal } from '@angular/core';
import { PairTextInputComponent } from '../../../shared/input/text/pair/pair-text-input.component';
import { DndBoardService } from '../../drag-and-drop/board/service/dnd-board.service';
import { DND_BOARD_SIZE_AU } from '../../drag-and-drop/utils/dnd.constants';

@Component({
  selector: 'app-game-settings',
  imports: [
    PairTextInputComponent
  ],
  templateUrl: './game-settings.component.html',
  styleUrl: './game-settings.component.scss',
})
export class GameSettingsComponent {
  private readonly dndBoardService: DndBoardService = inject<DndBoardService>(DndBoardService);

  // TODO: Maybe instead of the dndBoardService holding that size, it's instead here and you have a constant varaible for that board size somewhere else
  protected readonly maxDndBoardSize: number = DND_BOARD_SIZE_AU;

  public $boardSizeWidth: ModelSignal<number> = model<number>(this.maxDndBoardSize);

  public $boardSizeHeight: ModelSignal<number> = model<number>(this.maxDndBoardSize);

  constructor() {
    effect(() => {
      this.dndBoardService.dndBoardSizeAU = {
        width: this.$boardSizeWidth(),
        height: this.$boardSizeHeight()
      }
    });
  }
}

import { Component, input, InputSignal } from '@angular/core';
import { DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE } from '../../features/card-game-core/card-editor-face/constants/card-editor-face.constants';
import { Style } from '../../features/style/models/style';

@Component({
  selector: 'app-grid',
  imports: [],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
})
export class GridComponent {
  public readonly $style: InputSignal<Omit<Style, 'styleId'>> = input<Omit<Style, 'styleId'>>({
    'position': 'absolute',
    'inset': 'inherit',
    'transformOrigin': 'top left',
    'zIndex': '0',
    'pointerEvents': 'none'
  });

  public readonly $gridDimensions: InputSignal<{
    width: string,
    height: string
  }> = input<{
    width: string,
    height: string
  }>({
    width: '100%',
    height: '100%'
  });

  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  public readonly $cellSizeScreen: InputSignal<number> = input<number>(DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE);

  public readonly $snappedToGridColor: InputSignal<string> = input<string>('#4D8A98');

  public readonly $freeMovementColor: InputSignal<string> = input<string>('rgb(203 213 225)');

  protected getGridCellOutline(): string {
    let color: string = this.$shouldSnapToGrid() ? this.$snappedToGridColor() : this.$freeMovementColor();

    return `linear-gradient(to right, ${color} 1px, transparent 1px),
      linear-gradient(to bottom, ${color} 1px, transparent 1px)`;
  }
}

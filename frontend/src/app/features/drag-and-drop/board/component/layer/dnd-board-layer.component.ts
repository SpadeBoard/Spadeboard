import { Component, computed, input, InputSignal, Signal } from '@angular/core';

import { Coordinates } from '../../../../../utils/utils';
import { Style } from '../../../../style/models/style';
@Component({
  selector: 'app-dnd-board-layer',
  imports: [],
  templateUrl: './dnd-board-layer.component.html',
  styleUrl: './dnd-board-layer.component.scss'
})
export class DndBoardLayerComponent {
  // CHECKME: Make sure the layers and their movements work correctly, also the user should be able to add a background image for the layer then, and set the opacity, methinks
  public readonly $camera: InputSignal<Coordinates> = input<Coordinates>({
    x: -1,
    y: -1
  });

  public readonly $cellSize: InputSignal<number> = input<number>(-1);

  public readonly $style: InputSignal<Omit<Style, 'styleId'>> = input<Omit<Style, 'styleId'>>({
    'position': 'absolute',
    'width': '100vw',
    'height': '100vh',
    'inset': 'inherit',
    'border': '2px dashed red'
  });

  public readonly $transform: Signal<string> = computed<string>(() => `translate(${this.$camera().x * this.$cellSize()}px, ${this.$camera().y * this.$cellSize()}px)` );
}

import { Component, input, InputSignal } from '@angular/core';
import { Coordinates } from '../../utils';

@Component({
  selector: 'app-camera',
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss',
})
export class CameraComponent {
  // NOTE: So the camera should probably be using the arbitrary units - or local units and not global

  // CHECKME: Need a struct called Transformation to keep track of previous values?
  // Have the spatial transformation matrix service in here? Or decouple it and put it in the DndBoardService?

  public origin: Coordinates = {
    x: 0,
    y: 0
  };

  public position: Coordinates = {
    x: 0,
    y: 0
  };

  public rotation: number = 0;

  protected zoom: number = 1; // 1 = 100%, 2 = 200%, 0.5 = 50%

  public readonly $minRotation: InputSignal<number> = input<number>(-2 * Math.PI);
  public readonly $maxRotation: InputSignal<number> = input<number>(2 * Math.PI);

  public readonly $minZoom: InputSignal<number> = input<number>(0.1);
  public readonly $maxZoom: InputSignal<number> = input<number>(3);
}

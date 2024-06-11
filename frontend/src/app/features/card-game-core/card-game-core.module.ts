import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardComponent } from './components/card/card.component';
import { CardFaceComponent } from './components/card-face/card-face.component';
import { CardFaceElementComponent } from './components/card-face-element/card-face-element.component';

// CHECKME: Determine whether we should use modules at all, standalone modules are default
@NgModule({
  declarations: [
    CardComponent,
    CardFaceComponent,
    CardFaceElementComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CardComponent,
    CardFaceComponent,
    CardFaceElementComponent
  ], 
  providers: [
    
  ]
})
export class CardGameCoreModule { }

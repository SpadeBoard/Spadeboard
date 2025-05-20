import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardComponent } from './components/card/card.component';
import { CardFaceComponent } from './components/card-face/card-face.component';

// CHECKME: Determine whether we should use modules at all, standalone modules are default
@NgModule({
  declarations: [
    CardComponent,
    CardFaceComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CardComponent,
    CardFaceComponent
  ], 
  providers: [
    
  ]
})
export class CardGameCoreModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardComponent } from './card/components/core/card.component';
import { CardFaceComponent } from './card-face/components/core/card-face.component';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsCardFaceAttributesComponent } from './card-editor-controls-card-face-attributes.component';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorControlsCardFaceAttributesComponent', () => {
  let component: CardEditorControlsCardFaceAttributesComponent;
  let fixture: ComponentFixture<CardEditorControlsCardFaceAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsCardFaceAttributesComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsCardFaceAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

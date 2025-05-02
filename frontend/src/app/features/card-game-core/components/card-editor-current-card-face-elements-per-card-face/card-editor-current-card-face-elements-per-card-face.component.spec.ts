import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from './card-editor-current-card-face-elements-per-card-face.component';

describe('CardEditorCurrentCardFaceElementsPerCardFaceComponent', () => {
  let component: CardEditorCurrentCardFaceElementsPerCardFaceComponent;
  let fixture: ComponentFixture<CardEditorCurrentCardFaceElementsPerCardFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorCurrentCardFaceElementsPerCardFaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorCurrentCardFaceElementsPerCardFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

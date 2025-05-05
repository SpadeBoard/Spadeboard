import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsCardFaceElementsListComponent } from './card-editor-controls-card-face-elements-list.component';

describe('CardEditorControlsCardFaceElementsListComponent', () => {
  let component: CardEditorControlsCardFaceElementsListComponent;
  let fixture: ComponentFixture<CardEditorControlsCardFaceElementsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsCardFaceElementsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsCardFaceElementsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorCardFaceElementsComponent } from './card-editor-card-face-elements.component';

describe('CardEditorCardFaceElementsComponent', () => {
  let component: CardEditorCardFaceElementsComponent;
  let fixture: ComponentFixture<CardEditorCardFaceElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorCardFaceElementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorCardFaceElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

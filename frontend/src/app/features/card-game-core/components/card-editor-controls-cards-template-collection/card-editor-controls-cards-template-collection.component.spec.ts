import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsCardsTemplateCollectionComponent } from './card-editor-controls-cards-template-collection.component';

describe('CardEditorControlsCardsTemplateCollectionComponent', () => {
  let component: CardEditorControlsCardsTemplateCollectionComponent;
  let fixture: ComponentFixture<CardEditorControlsCardsTemplateCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsCardsTemplateCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsCardsTemplateCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

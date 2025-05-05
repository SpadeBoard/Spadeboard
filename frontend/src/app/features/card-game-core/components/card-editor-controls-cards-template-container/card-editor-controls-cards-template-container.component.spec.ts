import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsCardsTemplateContainerComponent } from './card-editor-controls-cards-template-container.component';

describe('CardEditorControlsCardsTemplateContainerComponent', () => {
  let component: CardEditorControlsCardsTemplateContainerComponent;
  let fixture: ComponentFixture<CardEditorControlsCardsTemplateContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsCardsTemplateContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsCardsTemplateContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

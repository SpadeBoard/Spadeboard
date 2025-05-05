import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignCardsTemplateContainerComponent } from './card-editor-controls-design-cards-template-container.component';

describe('CardEditorControlsDesignCardsTemplateContainerComponent', () => {
  let component: CardEditorControlsDesignCardsTemplateContainerComponent;
  let fixture: ComponentFixture<CardEditorControlsDesignCardsTemplateContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsDesignCardsTemplateContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsDesignCardsTemplateContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

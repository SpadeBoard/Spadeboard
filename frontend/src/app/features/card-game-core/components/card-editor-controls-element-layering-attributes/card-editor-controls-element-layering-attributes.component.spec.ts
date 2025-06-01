import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsElementLayeringAttributesComponent } from './card-editor-controls-element-layering-attributes.component';

describe('CardEditorControlsElementLayeringAttributesComponent', () => {
  let component: CardEditorControlsElementLayeringAttributesComponent;
  let fixture: ComponentFixture<CardEditorControlsElementLayeringAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsElementLayeringAttributesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsElementLayeringAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsElementAttributesComponent } from './card-editor-controls-element-attributes.component';

describe('CardEditorControlsElementAttributesComponent', () => {
  let component: CardEditorControlsElementAttributesComponent;
  let fixture: ComponentFixture<CardEditorControlsElementAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsElementAttributesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsElementAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignComponent } from './card-editor-controls-design.component';

describe('CardEditorControlsDesignComponent', () => {
  let component: CardEditorControlsDesignComponent;
  let fixture: ComponentFixture<CardEditorControlsDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

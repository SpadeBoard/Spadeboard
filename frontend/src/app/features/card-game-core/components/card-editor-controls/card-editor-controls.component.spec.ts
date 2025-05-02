import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorControlsComponent } from './card-editor-controls.component';

describe('CardEditorControlsComponent', () => {
  let component: CardEditorControlsComponent;
  let fixture: ComponentFixture<CardEditorControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

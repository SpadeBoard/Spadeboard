import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorElementDeleteButtonComponent } from './card-editor-element-delete-button.component';

describe('CardEditorElementDeleteButtonComponent', () => {
  let component: CardEditorElementDeleteButtonComponent;
  let fixture: ComponentFixture<CardEditorElementDeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorElementDeleteButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorElementDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

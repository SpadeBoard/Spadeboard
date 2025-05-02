import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorCardOperationsButtonComponent } from './card-editor-card-operations-button.component';

describe('CardEditorCardOperationsButtonComponent', () => {
  let component: CardEditorCardOperationsButtonComponent;
  let fixture: ComponentFixture<CardEditorCardOperationsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorCardOperationsButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorCardOperationsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorOperationsComponent } from './card-editor-operations.component';

describe('CardEditorOperationsComponent', () => {
  let component: CardEditorOperationsComponent;
  let fixture: ComponentFixture<CardEditorOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorOperationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorCloseComponent } from './card-editor-close.component';

describe('CardEditorCloseComponent', () => {
  let component: CardEditorCloseComponent;
  let fixture: ComponentFixture<CardEditorCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorCloseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorChangeFaceComponent } from './card-editor-change-face.component';

describe('CardEditorChangeFaceComponent', () => {
  let component: CardEditorChangeFaceComponent;
  let fixture: ComponentFixture<CardEditorChangeFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorChangeFaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorChangeFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

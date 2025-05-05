import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorPreviewChangeFaceComponent } from './card-editor-preview-change-face.component';

describe('CardEditorPreviewChangeFaceComponent', () => {
  let component: CardEditorPreviewChangeFaceComponent;
  let fixture: ComponentFixture<CardEditorPreviewChangeFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorPreviewChangeFaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorPreviewChangeFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorFacePreviewGridComponent } from './card-editor-face-preview-grid.component';

describe('CardEditorFacePreviewGridComponent', () => {
  let component: CardEditorFacePreviewGridComponent;
  let fixture: ComponentFixture<CardEditorFacePreviewGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorFacePreviewGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorFacePreviewGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorPreviewTagsComponent } from './card-editor-preview-tags.component';

describe('CardEditorPreviewTagsComponent', () => {
  let component: CardEditorPreviewTagsComponent;
  let fixture: ComponentFixture<CardEditorPreviewTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorPreviewTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorPreviewTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

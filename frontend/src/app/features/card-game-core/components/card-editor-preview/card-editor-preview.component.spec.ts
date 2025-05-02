import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorPreviewComponent } from './card-editor-preview.component';

describe('CardEditorPreviewComponent', () => {
  let component: CardEditorPreviewComponent;
  let fixture: ComponentFixture<CardEditorPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

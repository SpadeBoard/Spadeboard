import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorFacePreviewComponent } from './card-editor-face-preview.component';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorFacePreviewComponent', () => {
  let component: CardEditorFacePreviewComponent;
  let fixture: ComponentFixture<CardEditorFacePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorFacePreviewComponent],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CardEditorFacePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

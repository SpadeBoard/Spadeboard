import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceImageEditorComponent } from './card-face-image-editor.component';

describe('CardFaceImageEditorComponent', () => {
  let component: CardFaceImageEditorComponent;
  let fixture: ComponentFixture<CardFaceImageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceImageEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceImageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

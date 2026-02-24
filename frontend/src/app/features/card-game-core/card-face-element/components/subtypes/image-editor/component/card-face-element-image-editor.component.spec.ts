import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementImageEditorComponent } from './card-face-element-image-editor.component';

describe('CardFaceElementImageEditorComponent', () => {
  let component: CardFaceElementImageEditorComponent;
  let fixture: ComponentFixture<CardFaceElementImageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementImageEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementImageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceImageComponent } from './card-face-image.component';

describe('CardFaceImageComponent', () => {
  let component: CardFaceImageComponent;
  let fixture: ComponentFixture<CardFaceImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

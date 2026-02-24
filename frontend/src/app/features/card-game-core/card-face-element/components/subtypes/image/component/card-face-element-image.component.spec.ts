import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementImageComponent } from './card-face-element-image.component';

describe('CardFaceElementImageComponent', () => {
  let component: CardFaceElementImageComponent;
  let fixture: ComponentFixture<CardFaceElementImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

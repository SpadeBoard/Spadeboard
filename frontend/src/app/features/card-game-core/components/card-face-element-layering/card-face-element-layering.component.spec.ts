import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementLayeringComponent } from './card-face-element-layering.component';

describe('CardFaceElementLayeringComponent', () => {
  let component: CardFaceElementLayeringComponent;
  let fixture: ComponentFixture<CardFaceElementLayeringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementLayeringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementLayeringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceComponent } from './card-face.component';

describe('CardFaceComponent', () => {
  let component: CardFaceComponent;
  let fixture: ComponentFixture<CardFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

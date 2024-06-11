import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceRteComponent } from './card-face-rte.component';

describe('CardFaceRteComponent', () => {
  let component: CardFaceRteComponent;
  let fixture: ComponentFixture<CardFaceRteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceRteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceRteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

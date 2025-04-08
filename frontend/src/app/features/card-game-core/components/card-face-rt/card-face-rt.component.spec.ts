import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceRtComponent } from './card-face-rt.component';

describe('CardFaceRtComponent', () => {
  let component: CardFaceRtComponent;
  let fixture: ComponentFixture<CardFaceRtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceRtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceRtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

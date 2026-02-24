import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementRtComponent } from './card-face-element-rt.component';

describe('CardFaceElementRtComponent', () => {
  let component: CardFaceElementRtComponent;
  let fixture: ComponentFixture<CardFaceElementRtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementRtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementRtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

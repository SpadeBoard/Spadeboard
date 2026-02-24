import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceBorderWidthComponent } from './card-face-border-width.component';

describe('CardFaceBorderWidthComponent', () => {
  let component: CardFaceBorderWidthComponent;
  let fixture: ComponentFixture<CardFaceBorderWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceBorderWidthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceBorderWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

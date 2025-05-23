import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceAttributesBorderWidthComponent } from './card-face-attributes-border-width.component';

describe('CardFaceAttributesBorderWidthComponent', () => {
  let component: CardFaceAttributesBorderWidthComponent;
  let fixture: ComponentFixture<CardFaceAttributesBorderWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceAttributesBorderWidthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceAttributesBorderWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

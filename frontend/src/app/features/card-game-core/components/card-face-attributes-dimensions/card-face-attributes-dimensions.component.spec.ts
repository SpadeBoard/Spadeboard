import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceAttributesDimensionsComponent } from './card-face-attributes-dimensions.component';

describe('CardFaceAttributesDimensionsComponent', () => {
  let component: CardFaceAttributesDimensionsComponent;
  let fixture: ComponentFixture<CardFaceAttributesDimensionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceAttributesDimensionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceAttributesDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

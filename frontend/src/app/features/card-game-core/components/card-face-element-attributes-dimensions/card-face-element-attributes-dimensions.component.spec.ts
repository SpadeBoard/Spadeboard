import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementAttributesDimensionsComponent } from './card-face-element-attributes-dimensions.component';

describe('CardFaceElementAttributesDimensionsComponent', () => {
  let component: CardFaceElementAttributesDimensionsComponent;
  let fixture: ComponentFixture<CardFaceElementAttributesDimensionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementAttributesDimensionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementAttributesDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

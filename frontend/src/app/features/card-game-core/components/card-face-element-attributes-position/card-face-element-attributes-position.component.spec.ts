import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementAttributesPositionComponent } from './card-face-element-attributes-position.component';

describe('CardFaceElementAttributesPositionComponent', () => {
  let component: CardFaceElementAttributesPositionComponent;
  let fixture: ComponentFixture<CardFaceElementAttributesPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementAttributesPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementAttributesPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

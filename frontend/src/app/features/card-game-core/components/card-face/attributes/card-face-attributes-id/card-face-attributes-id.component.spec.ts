import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceAttributesIdComponent } from './card-face-attributes-id.component';

describe('CardFaceAttributesIdComponent', () => {
  let component: CardFaceAttributesIdComponent;
  let fixture: ComponentFixture<CardFaceAttributesIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceAttributesIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceAttributesIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

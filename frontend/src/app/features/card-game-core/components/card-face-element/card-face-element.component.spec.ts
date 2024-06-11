import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementComponent } from './card-face-element.component';

describe('CardFaceElementComponent', () => {
  let component: CardFaceElementComponent;
  let fixture: ComponentFixture<CardFaceElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

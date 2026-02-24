import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementControlsComponent } from './card-face-element-controls.component';

describe('CardFaceElementControlsComponent', () => {
  let component: CardFaceElementControlsComponent;
  let fixture: ComponentFixture<CardFaceElementControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

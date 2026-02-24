import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPositionPerRoomComponent } from './card-position-per-room.component';

describe('CardPositionPerRoomComponent', () => {
  let component: CardPositionPerRoomComponent;
  let fixture: ComponentFixture<CardPositionPerRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPositionPerRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPositionPerRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

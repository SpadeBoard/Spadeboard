import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRoomNavComponent } from './game-room-nav.component';

describe('GameRoomNavComponent', () => {
  let component: GameRoomNavComponent;
  let fixture: ComponentFixture<GameRoomNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameRoomNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameRoomNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndBoardComponent } from './dnd-board.component';

describe('DndBoardComponent', () => {
  let component: DndBoardComponent;
  let fixture: ComponentFixture<DndBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

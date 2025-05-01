import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndBoardGridComponent } from './dnd-board-grid.component';

describe('DndBoardGridComponent', () => {
  let component: DndBoardGridComponent;
  let fixture: ComponentFixture<DndBoardGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndBoardGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndBoardGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

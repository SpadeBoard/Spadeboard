import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndCardBoardComponent } from './dnd-card-board.component';

describe('DndCardBoardComponent', () => {
  let component: DndCardBoardComponent;
  let fixture: ComponentFixture<DndCardBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndCardBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndCardBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

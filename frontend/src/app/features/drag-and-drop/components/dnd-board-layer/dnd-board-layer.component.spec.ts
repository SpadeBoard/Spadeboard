import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndBoardLayerComponent } from './dnd-board-layer.component';

describe('DndBoardLayerComponent', () => {
  let component: DndBoardLayerComponent;
  let fixture: ComponentFixture<DndBoardLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndBoardLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndBoardLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

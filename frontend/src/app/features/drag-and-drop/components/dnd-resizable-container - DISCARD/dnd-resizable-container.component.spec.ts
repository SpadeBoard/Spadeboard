import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndResizableContainerComponent } from './dnd-resizable-container.component';

describe('DndResizableContainerComponent', () => {
  let component: DndResizableContainerComponent;
  let fixture: ComponentFixture<DndResizableContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndResizableContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndResizableContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndWrapperComponent } from './dnd-wrapper.component';

describe('DndWrapperComponent', () => {
  let component: DndWrapperComponent;
  let fixture: ComponentFixture<DndWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

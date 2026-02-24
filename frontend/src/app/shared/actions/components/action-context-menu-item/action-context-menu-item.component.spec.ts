import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionContextMenuItemComponent } from './action-context-menu-item.component';

describe('ActionContextMenuItemComponent', () => {
  let component: ActionContextMenuItemComponent;
  let fixture: ComponentFixture<ActionContextMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionContextMenuItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionContextMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

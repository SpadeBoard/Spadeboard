import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionContextMenuComponent } from './action-context-menu.component';

describe('ActionContextMenuComponent', () => {
  let component: ActionContextMenuComponent;
  let fixture: ComponentFixture<ActionContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionContextMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

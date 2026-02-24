import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaceCardMenuComponent } from './displace-card-menu.component';

describe('DisplaceCardMenuComponent', () => {
  let component: DisplaceCardMenuComponent;
  let fixture: ComponentFixture<DisplaceCardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplaceCardMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplaceCardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

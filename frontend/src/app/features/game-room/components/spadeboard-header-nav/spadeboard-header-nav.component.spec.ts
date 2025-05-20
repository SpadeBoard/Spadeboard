import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpadeboardHeaderNavComponent } from './spadeboard-header-nav.component';

describe('SpadeboardHeaderNavComponent', () => {
  let component: SpadeboardHeaderNavComponent;
  let fixture: ComponentFixture<SpadeboardHeaderNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpadeboardHeaderNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpadeboardHeaderNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardTextInputComponent } from './standard-text-input.component';

describe('StandardTextInputComponent', () => {
  let component: StandardTextInputComponent;
  let fixture: ComponentFixture<StandardTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardTextInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandardTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

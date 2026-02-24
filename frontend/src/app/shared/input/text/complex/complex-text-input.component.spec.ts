import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexTextInputComponent } from './complex-text-input.component';

describe('ComplexTextInputComponent', () => {
  let component: ComplexTextInputComponent;
  let fixture: ComponentFixture<ComplexTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplexTextInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplexTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

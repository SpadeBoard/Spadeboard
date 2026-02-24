import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairTextInputComponent } from './pair-text-input.component';

describe('PairTextInputComponent', () => {
  let component: PairTextInputComponent;
  let fixture: ComponentFixture<PairTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PairTextInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PairTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

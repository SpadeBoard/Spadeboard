import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDeleteButtonComponent } from './card-delete-button.component';

describe('CardDeleteButtonComponent', () => {
  let component: CardDeleteButtonComponent;
  let fixture: ComponentFixture<CardDeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDeleteButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPlaceholderComponent } from './card-placeholder.component';

describe('CardPlaceholderComponent', () => {
  let component: CardPlaceholderComponent;
  let fixture: ComponentFixture<CardPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

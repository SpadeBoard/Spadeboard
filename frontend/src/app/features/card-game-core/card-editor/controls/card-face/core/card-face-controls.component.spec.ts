import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceControlsComponent } from './card-face-controls.component';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceControlsComponent', () => {
  let component: CardFaceControlsComponent;
  let fixture: ComponentFixture<CardFaceControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceControlsComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

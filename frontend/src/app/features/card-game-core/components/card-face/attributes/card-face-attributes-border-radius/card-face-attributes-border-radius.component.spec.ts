import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceAttributesBorderRadiusComponent } from './card-face-attributes-border-radius.component';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceAttributesBorderRadiusComponent', () => {
  let component: CardFaceAttributesBorderRadiusComponent;
  let fixture: ComponentFixture<CardFaceAttributesBorderRadiusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceAttributesBorderRadiusComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceAttributesBorderRadiusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

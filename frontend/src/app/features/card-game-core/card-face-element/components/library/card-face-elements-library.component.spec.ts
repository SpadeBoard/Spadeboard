import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementsLibraryComponent } from './card-face-elements-library.component';

describe('CardFaceElementsLibraryComponent', () => {
  let component: CardFaceElementsLibraryComponent;
  let fixture: ComponentFixture<CardFaceElementsLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementsLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementsLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

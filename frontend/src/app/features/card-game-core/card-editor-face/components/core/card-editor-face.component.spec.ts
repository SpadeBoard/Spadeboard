import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorFaceComponent } from '../card-editor-face.component';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorFaceComponent', () => {
  let component: CardEditorFaceComponent;
  let fixture: ComponentFixture<CardEditorFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorFaceComponent],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CardEditorFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorInfoComponent } from './card-editor-info.component';

describe('CardEditorInfoComponent', () => {
  let component: CardEditorInfoComponent;
  let fixture: ComponentFixture<CardEditorInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

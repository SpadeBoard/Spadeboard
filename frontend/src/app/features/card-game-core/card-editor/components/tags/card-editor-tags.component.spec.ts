import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditorTagsComponent } from './card-editor-tags.component';

describe('CardEditorTagsComponent', () => {
  let component: CardEditorTagsComponent;
  let fixture: ComponentFixture<CardEditorTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditorTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditorTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCardTemplateCollectionComponent } from './new-card-template-collection.component';

describe('NewCardTemplateCollectionComponent', () => {
  let component: NewCardTemplateCollectionComponent;
  let fixture: ComponentFixture<NewCardTemplateCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCardTemplateCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCardTemplateCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

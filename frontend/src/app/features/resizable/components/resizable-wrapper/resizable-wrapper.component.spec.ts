import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizableWrapperComponent } from './resizable-wrapper.component';

describe('ResizableWrapperComponent', () => {
  let component: ResizableWrapperComponent;
  let fixture: ComponentFixture<ResizableWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizableWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResizableWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

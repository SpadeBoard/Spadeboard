import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedExternalIframeComponent } from './embedded-external-iframe.component';

describe('EmbeddedExternalIframeComponent', () => {
  let component: EmbeddedExternalIframeComponent;
  let fixture: ComponentFixture<EmbeddedExternalIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedExternalIframeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmbeddedExternalIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

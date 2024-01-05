import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyAttachmentComponent } from './property-attachment.component';

describe('PropertyAttachmentComponent', () => {
  let component: PropertyAttachmentComponent;
  let fixture: ComponentFixture<PropertyAttachmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyAttachmentComponent]
    });
    fixture = TestBed.createComponent(PropertyAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

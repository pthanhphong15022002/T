import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyAttachmentAddRowComponent } from './property-attachment-add-row.component';

describe('PropertyAttachmentAddRowComponent', () => {
  let component: PropertyAttachmentAddRowComponent;
  let fixture: ComponentFixture<PropertyAttachmentAddRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyAttachmentAddRowComponent]
    });
    fixture = TestBed.createComponent(PropertyAttachmentAddRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

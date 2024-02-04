import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentGridComponent } from './attachment-grid.component';

describe('AttachmentGridComponent', () => {
  let component: AttachmentGridComponent;
  let fixture: ComponentFixture<AttachmentGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttachmentGridComponent]
    });
    fixture = TestBed.createComponent(AttachmentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

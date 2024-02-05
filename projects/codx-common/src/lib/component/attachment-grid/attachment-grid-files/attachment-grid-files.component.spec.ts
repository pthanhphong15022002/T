import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentGridFilesComponent } from './attachment-grid-files.component';

describe('AttachmentGridFilesComponent', () => {
  let component: AttachmentGridFilesComponent;
  let fixture: ComponentFixture<AttachmentGridFilesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttachmentGridFilesComponent]
    });
    fixture = TestBed.createComponent(AttachmentGridFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxFilesAttachmentComponent } from './codx-files-attachment.component';

describe('CodxFilesAttachmentComponent', () => {
  let component: CodxFilesAttachmentComponent;
  let fixture: ComponentFixture<CodxFilesAttachmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxFilesAttachmentComponent]
    });
    fixture = TestBed.createComponent(CodxFilesAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

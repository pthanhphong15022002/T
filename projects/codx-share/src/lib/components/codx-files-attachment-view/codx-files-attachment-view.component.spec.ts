import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxFilesAttachmentViewComponent } from './codx-files-attachment-view.component';

describe('CodxFilesAttachmentViewComponent', () => {
  let component: CodxFilesAttachmentViewComponent;
  let fixture: ComponentFixture<CodxFilesAttachmentViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxFilesAttachmentViewComponent]
    });
    fixture = TestBed.createComponent(CodxFilesAttachmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentWebComponent } from './attachment-web.component';

describe('AttachmentWebComponent', () => {
  let component: AttachmentWebComponent;
  let fixture: ComponentFixture<AttachmentWebComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttachmentWebComponent]
    });
    fixture = TestBed.createComponent(AttachmentWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

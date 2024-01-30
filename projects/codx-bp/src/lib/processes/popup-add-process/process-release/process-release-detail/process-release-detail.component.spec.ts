import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessReleaseDetailComponent } from './process-release-detail.component';

describe('ProcessReleaseDetailComponent', () => {
  let component: ProcessReleaseDetailComponent;
  let fixture: ComponentFixture<ProcessReleaseDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessReleaseDetailComponent]
    });
    fixture = TestBed.createComponent(ProcessReleaseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessReleaseComponent } from './process-release.component';

describe('ProcessReleaseComponent', () => {
  let component: ProcessReleaseComponent;
  let fixture: ComponentFixture<ProcessReleaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessReleaseComponent]
    });
    fixture = TestBed.createComponent(ProcessReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

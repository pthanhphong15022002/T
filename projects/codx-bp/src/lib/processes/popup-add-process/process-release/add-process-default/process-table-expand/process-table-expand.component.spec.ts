import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessTableExpandComponent } from './process-table-expand.component';

describe('ProcessTableExpandComponent', () => {
  let component: ProcessTableExpandComponent;
  let fixture: ComponentFixture<ProcessTableExpandComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessTableExpandComponent]
    });
    fixture = TestBed.createComponent(ProcessTableExpandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

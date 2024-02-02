import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFileFromProcessDefaultComponent } from './add-file-from-process-default.component';

describe('AddFileFromProcessDefaultComponent', () => {
  let component: AddFileFromProcessDefaultComponent;
  let fixture: ComponentFixture<AddFileFromProcessDefaultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFileFromProcessDefaultComponent]
    });
    fixture = TestBed.createComponent(AddFileFromProcessDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

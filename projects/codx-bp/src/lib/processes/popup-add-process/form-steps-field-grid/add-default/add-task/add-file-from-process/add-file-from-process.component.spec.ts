import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFileFromProcessComponent } from './add-file-from-process.component';

describe('AddFileFromProcessComponent', () => {
  let component: AddFileFromProcessComponent;
  let fixture: ComponentFixture<AddFileFromProcessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFileFromProcessComponent]
    });
    fixture = TestBed.createComponent(AddFileFromProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

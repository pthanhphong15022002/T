import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImportDetailsComponent } from './add-import-details.component';

describe('AddImportDetailsComponent', () => {
  let component: AddImportDetailsComponent;
  let fixture: ComponentFixture<AddImportDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddImportDetailsComponent]
    });
    fixture = TestBed.createComponent(AddImportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

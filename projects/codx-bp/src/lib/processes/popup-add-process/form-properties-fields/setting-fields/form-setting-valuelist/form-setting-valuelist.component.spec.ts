import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSettingValueListComponent } from './form-setting-valuelist.component';

describe('FormSettingValueListComponent', () => {
  let component: FormSettingValueListComponent;
  let fixture: ComponentFixture<FormSettingValueListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormSettingValueListComponent],
    });
    fixture = TestBed.createComponent(FormSettingValueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

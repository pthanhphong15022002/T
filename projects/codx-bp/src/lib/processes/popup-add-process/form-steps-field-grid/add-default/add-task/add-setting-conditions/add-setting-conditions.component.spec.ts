import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSettingConditionsComponent } from './add-setting-conditions.component';

describe('AddSettingConditionsComponent', () => {
  let component: AddSettingConditionsComponent;
  let fixture: ComponentFixture<AddSettingConditionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSettingConditionsComponent]
    });
    fixture = TestBed.createComponent(AddSettingConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

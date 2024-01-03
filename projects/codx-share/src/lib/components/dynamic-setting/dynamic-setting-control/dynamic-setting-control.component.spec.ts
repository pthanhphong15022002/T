import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSettingControlComponent } from './dynamic-setting-control.component';

describe('DynamicSettingControlComponent', () => {
  let component: DynamicSettingControlComponent;
  let fixture: ComponentFixture<DynamicSettingControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicSettingControlComponent]
    });
    fixture = TestBed.createComponent(DynamicSettingControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

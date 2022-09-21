import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingdetailComponent } from './settingdetail.component';

describe('SettingdetailComponent', () => {
  let component: SettingdetailComponent;
  let fixture: ComponentFixture<SettingdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingdetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

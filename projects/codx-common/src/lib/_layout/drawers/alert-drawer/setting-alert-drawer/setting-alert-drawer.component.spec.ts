import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAlertDrawerComponent } from './setting-alert-drawer.component';

describe('SettingAlertDrawerComponent', () => {
  let component: SettingAlertDrawerComponent;
  let fixture: ComponentFixture<SettingAlertDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingAlertDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingAlertDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

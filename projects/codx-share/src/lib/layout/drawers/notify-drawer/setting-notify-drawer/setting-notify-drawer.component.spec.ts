import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingNotifyDrawerComponent } from './setting-notify-drawer.component';

describe('SettingNotifyDrawerComponent', () => {
  let component: SettingNotifyDrawerComponent;
  let fixture: ComponentFixture<SettingNotifyDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingNotifyDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingNotifyDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

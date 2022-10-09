import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingCycleComponent } from './setting-cycle.component';

describe('SettingCycleComponent', () => {
  let component: SettingCycleComponent;
  let fixture: ComponentFixture<SettingCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingCycleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

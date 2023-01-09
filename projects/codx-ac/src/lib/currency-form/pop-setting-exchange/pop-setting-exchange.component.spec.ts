import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopSettingExchangeComponent } from './pop-setting-exchange.component';

describe('PopSettingExchangeComponent', () => {
  let component: PopSettingExchangeComponent;
  let fixture: ComponentFixture<PopSettingExchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopSettingExchangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopSettingExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

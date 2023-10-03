import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeRateSettingAddComponent } from './currency-exchangerate-setting-add.component';

describe('PopSettingExchangeComponent', () => {
  let component: ExchangeRateSettingAddComponent;
  let fixture: ComponentFixture<ExchangeRateSettingAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExchangeRateSettingAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeRateSettingAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

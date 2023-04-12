import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddCurrencyComponent } from './pop-add-currency.component';

describe('PopAddCurrencyComponent', () => {
  let component: PopAddCurrencyComponent;
  let fixture: ComponentFixture<PopAddCurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddCurrencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

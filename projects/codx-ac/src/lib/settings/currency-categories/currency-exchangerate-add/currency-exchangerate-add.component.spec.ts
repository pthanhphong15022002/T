import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangerateAddComponent } from './currency-exchangerate-add.component';

describe('PopAddExchangerateComponent', () => {
  let component: ExchangerateAddComponent;
  let fixture: ComponentFixture<ExchangerateAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExchangerateAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangerateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAssurTaxBankaccInfoComponent } from './employee-assur-tax-bankacc-info.component';

describe('EmployeeAssurTaxBankaccInfoComponent', () => {
  let component: EmployeeAssurTaxBankaccInfoComponent;
  let fixture: ComponentFixture<EmployeeAssurTaxBankaccInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAssurTaxBankaccInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAssurTaxBankaccInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

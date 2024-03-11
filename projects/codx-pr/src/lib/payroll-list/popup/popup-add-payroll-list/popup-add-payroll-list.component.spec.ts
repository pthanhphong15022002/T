import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddPayrollListComponent } from './popup-add-payroll-list.component';

describe('PopupAddPayrollListComponent', () => {
  let component: PopupAddPayrollListComponent;
  let fixture: ComponentFixture<PopupAddPayrollListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddPayrollListComponent]
    });
    fixture = TestBed.createComponent(PopupAddPayrollListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

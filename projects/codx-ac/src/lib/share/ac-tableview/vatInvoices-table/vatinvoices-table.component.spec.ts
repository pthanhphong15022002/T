import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatinvoicesTableComponent } from './vatinvoices-table.component';

describe('VatinvoicesTableComponent', () => {
  let component: VatinvoicesTableComponent;
  let fixture: ComponentFixture<VatinvoicesTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatinvoicesTableComponent]
    });
    fixture = TestBed.createComponent(VatinvoicesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

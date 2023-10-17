import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesinvoicesTableComponent } from './salesinvoices-table.component';

describe('SalesinvoicesTableComponent', () => {
  let component: SalesinvoicesTableComponent;
  let fixture: ComponentFixture<SalesinvoicesTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesinvoicesTableComponent]
    });
    fixture = TestBed.createComponent(SalesinvoicesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesinvoicesDetailComponent } from './salesinvoices-detail.component';

describe('SalesinvoicesDetailComponent', () => {
  let component: SalesinvoicesDetailComponent;
  let fixture: ComponentFixture<SalesinvoicesDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesinvoicesDetailComponent]
    });
    fixture = TestBed.createComponent(SalesinvoicesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

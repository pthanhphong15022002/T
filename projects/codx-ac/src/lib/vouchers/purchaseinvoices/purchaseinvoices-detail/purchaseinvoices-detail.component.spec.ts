import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseinvoicesDetailComponent } from './purchaseinvoices-detail.component';

describe('PurchaseinvoicesDetailComponent', () => {
  let component: PurchaseinvoicesDetailComponent;
  let fixture: ComponentFixture<PurchaseinvoicesDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseinvoicesDetailComponent]
    });
    fixture = TestBed.createComponent(PurchaseinvoicesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

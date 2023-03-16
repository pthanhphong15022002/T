import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseinvoicesComponent } from './purchaseinvoices.component';

describe('PurchaseinvoicesComponent', () => {
  let component: PurchaseinvoicesComponent;
  let fixture: ComponentFixture<PurchaseinvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseinvoicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseinvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

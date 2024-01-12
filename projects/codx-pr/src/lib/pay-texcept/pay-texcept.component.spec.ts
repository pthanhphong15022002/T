import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayTExceptComponent } from './pay-texcept.component';

describe('PayTExceptComponent', () => {
  let component: PayTExceptComponent;
  let fixture: ComponentFixture<PayTExceptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayTExceptComponent]
    });
    fixture = TestBed.createComponent(PayTExceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

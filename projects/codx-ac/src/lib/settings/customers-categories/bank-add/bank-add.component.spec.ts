import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAddComponent } from './bank-add.component';

describe('PopAddBankComponent', () => {
  let component: BankAddComponent;
  let fixture: ComponentFixture<BankAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

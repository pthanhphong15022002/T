import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddBankComponent } from './pop-add-bank.component';

describe('PopAddBankComponent', () => {
  let component: PopAddBankComponent;
  let fixture: ComponentFixture<PopAddBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

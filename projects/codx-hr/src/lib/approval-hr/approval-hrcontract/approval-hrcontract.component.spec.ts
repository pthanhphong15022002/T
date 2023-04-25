import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalHRContractComponent } from './approval-hrcontract.component';

describe('ApprovalHRContractComponent', () => {
  let component: ApprovalHRContractComponent;
  let fixture: ComponentFixture<ApprovalHRContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalHRContractComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalHRContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

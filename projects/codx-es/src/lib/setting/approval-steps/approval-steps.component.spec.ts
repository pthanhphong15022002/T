import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalStepsComponent } from './approval-steps.component';

describe('ApprovalStepsComponent', () => {
  let component: ApprovalStepsComponent;
  let fixture: ComponentFixture<ApprovalStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalStepsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

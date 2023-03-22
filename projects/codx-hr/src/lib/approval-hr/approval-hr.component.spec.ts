import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalHrComponent } from './approval-hr.component';

describe('ApprovelHrComponent', () => {
  let component: ApprovalHrComponent;
  let fixture: ComponentFixture<ApprovalHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalHrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

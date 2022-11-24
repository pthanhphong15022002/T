import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxApproveStepsComponent } from './codx-approve-steps.component';

describe('CodxApproveStepsComponent', () => {
  let component: CodxApproveStepsComponent;
  let fixture: ComponentFixture<CodxApproveStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxApproveStepsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxApproveStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTransactionsUpdateParasComponent } from './issue-transactions-update-paras.component';

describe('IssueTransactionsUpdateParasComponent', () => {
  let component: IssueTransactionsUpdateParasComponent;
  let fixture: ComponentFixture<IssueTransactionsUpdateParasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueTransactionsUpdateParasComponent]
    });
    fixture = TestBed.createComponent(IssueTransactionsUpdateParasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

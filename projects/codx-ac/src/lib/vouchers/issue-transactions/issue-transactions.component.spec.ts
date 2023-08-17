import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTransactionsComponent } from './issue-transactions.component';

describe('IssueTransactionsComponent', () => {
  let component: IssueTransactionsComponent;
  let fixture: ComponentFixture<IssueTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueTransactionsComponent]
    });
    fixture = TestBed.createComponent(IssueTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

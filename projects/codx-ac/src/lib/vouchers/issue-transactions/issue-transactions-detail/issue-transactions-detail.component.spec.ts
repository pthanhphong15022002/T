import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTransactionsDetailComponent } from './issue-transactions-detail.component';

describe('IssueTransactionsDetailComponent', () => {
  let component: IssueTransactionsDetailComponent;
  let fixture: ComponentFixture<IssueTransactionsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueTransactionsDetailComponent]
    });
    fixture = TestBed.createComponent(IssueTransactionsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

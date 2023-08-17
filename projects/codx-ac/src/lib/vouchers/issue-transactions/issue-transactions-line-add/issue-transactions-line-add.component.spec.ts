import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTransactionsLineAddComponent } from './issue-transactions-line-add.component';

describe('IssueTransactionsLineAddComponent', () => {
  let component: IssueTransactionsLineAddComponent;
  let fixture: ComponentFixture<IssueTransactionsLineAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueTransactionsLineAddComponent]
    });
    fixture = TestBed.createComponent(IssueTransactionsLineAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

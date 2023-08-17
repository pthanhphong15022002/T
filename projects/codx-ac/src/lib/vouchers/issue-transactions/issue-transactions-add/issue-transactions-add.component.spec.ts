import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTransactionsAddComponent } from './issue-transactions-add.component';

describe('IssueTransactionsAddComponent', () => {
  let component: IssueTransactionsAddComponent;
  let fixture: ComponentFixture<IssueTransactionsAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueTransactionsAddComponent]
    });
    fixture = TestBed.createComponent(IssueTransactionsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

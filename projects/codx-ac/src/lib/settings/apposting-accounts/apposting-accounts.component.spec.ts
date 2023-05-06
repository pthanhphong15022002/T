import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APPostingAccountsComponent } from './apposting-accounts.component';

describe('APPostingAccountsComponent', () => {
  let component: APPostingAccountsComponent;
  let fixture: ComponentFixture<APPostingAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ APPostingAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(APPostingAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

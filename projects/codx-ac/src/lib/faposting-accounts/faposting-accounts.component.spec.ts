import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FAPostingAccountsComponent } from './faposting-accounts.component';

describe('FAPostingAccountsComponent', () => {
  let component: FAPostingAccountsComponent;
  let fixture: ComponentFixture<FAPostingAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FAPostingAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FAPostingAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

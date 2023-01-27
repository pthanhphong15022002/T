import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddAccountsComponent } from './pop-add-accounts.component';

describe('PopAddAccountsComponent', () => {
  let component: PopAddAccountsComponent;
  let fixture: ComponentFixture<PopAddAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

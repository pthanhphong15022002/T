import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArPostingAccountsComponent } from './ar-posting-accounts.component';

describe('ArPostingAccountsComponent', () => {
  let component: ArPostingAccountsComponent;
  let fixture: ComponentFixture<ArPostingAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArPostingAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArPostingAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

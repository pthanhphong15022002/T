import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCoinComponent } from './policy-coin.component';

describe('PolicyCoinComponent', () => {
  let component: PolicyCoinComponent;
  let fixture: ComponentFixture<PolicyCoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyCoinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyCoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

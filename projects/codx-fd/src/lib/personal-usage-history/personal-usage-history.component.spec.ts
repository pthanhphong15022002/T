import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalUsageHistoryComponent } from './personal-usage-history.component';

describe('PersonalUsageHistoryComponent', () => {
  let component: PersonalUsageHistoryComponent;
  let fixture: ComponentFixture<PersonalUsageHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalUsageHistoryComponent]
    });
    fixture = TestBed.createComponent(PersonalUsageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDashboardLeaveComponent } from './profile-dashboard-leave.component';

describe('ProfileDashboardLeaveComponent', () => {
  let component: ProfileDashboardLeaveComponent;
  let fixture: ComponentFixture<ProfileDashboardLeaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileDashboardLeaveComponent]
    });
    fixture = TestBed.createComponent(ProfileDashboardLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

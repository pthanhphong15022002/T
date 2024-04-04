import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRegisterAprroveComponent } from './dashboard-register-aprrove.component';

describe('DashboardRegisterAprroveComponent', () => {
  let component: DashboardRegisterAprroveComponent;
  let fixture: ComponentFixture<DashboardRegisterAprroveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardRegisterAprroveComponent]
    });
    fixture = TestBed.createComponent(DashboardRegisterAprroveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

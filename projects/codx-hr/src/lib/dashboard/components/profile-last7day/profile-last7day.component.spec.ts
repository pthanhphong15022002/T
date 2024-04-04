import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileLast7dayComponent } from './profile-last7day.component';

describe('ProfileLast7dayComponent', () => {
  let component: ProfileLast7dayComponent;
  let fixture: ComponentFixture<ProfileLast7dayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileLast7dayComponent]
    });
    fixture = TestBed.createComponent(ProfileLast7dayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

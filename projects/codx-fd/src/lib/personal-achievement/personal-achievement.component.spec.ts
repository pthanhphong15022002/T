import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalAchievementComponent } from './personal-achievement.component';

describe('PersonalAchievementComponent', () => {
  let component: PersonalAchievementComponent;
  let fixture: ComponentFixture<PersonalAchievementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalAchievementComponent]
    });
    fixture = TestBed.createComponent(PersonalAchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

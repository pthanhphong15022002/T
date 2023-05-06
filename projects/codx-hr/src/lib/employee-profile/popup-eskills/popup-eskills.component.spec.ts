import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupESkillsComponent } from './popup-eskills.component';

describe('PopupESkillsComponent', () => {
  let component: PopupESkillsComponent;
  let fixture: ComponentFixture<PopupESkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupESkillsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupESkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

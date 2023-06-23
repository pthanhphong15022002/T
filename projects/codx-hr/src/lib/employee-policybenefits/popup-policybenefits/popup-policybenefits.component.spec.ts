import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPolicybenefitsComponent } from './popup-policybenefits.component';

describe('PopupPolicybenefitsComponent', () => {
  let component: PopupPolicybenefitsComponent;
  let fixture: ComponentFixture<PopupPolicybenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupPolicybenefitsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPolicybenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

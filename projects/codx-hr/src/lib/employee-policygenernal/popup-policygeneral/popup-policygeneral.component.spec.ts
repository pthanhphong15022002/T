import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPolicygeneralComponent } from './popup-policygeneral.component';

describe('PopupPolicygeneralComponent', () => {
  let component: PopupPolicygeneralComponent;
  let fixture: ComponentFixture<PopupPolicygeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupPolicygeneralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPolicygeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

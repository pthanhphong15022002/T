import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPolicyalComponent } from './popup-policyal.component';

describe('PopupPolicyalComponent', () => {
  let component: PopupPolicyalComponent;
  let fixture: ComponentFixture<PopupPolicyalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupPolicyalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPolicyalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

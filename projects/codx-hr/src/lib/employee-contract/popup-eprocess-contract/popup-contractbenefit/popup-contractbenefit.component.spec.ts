import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupContractbenefitComponent } from './popup-contractbenefit.component';

describe('PopupContractbenefitComponent', () => {
  let component: PopupContractbenefitComponent;
  let fixture: ComponentFixture<PopupContractbenefitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupContractbenefitComponent]
    });
    fixture = TestBed.createComponent(PopupContractbenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

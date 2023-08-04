import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupBantDealComponent } from './popup-bant-deal.component';

describe('PopupBantDealComponent', () => {
  let component: PopupBantDealComponent;
  let fixture: ComponentFixture<PopupBantDealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupBantDealComponent]
    });
    fixture = TestBed.createComponent(PopupBantDealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

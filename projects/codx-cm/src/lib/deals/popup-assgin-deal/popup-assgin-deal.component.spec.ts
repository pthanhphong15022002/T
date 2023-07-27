import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAssginDealComponent } from './popup-assgin-deal.component';

describe('PopupAssginDealComponent', () => {
  let component: PopupAssginDealComponent;
  let fixture: ComponentFixture<PopupAssginDealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAssginDealComponent]
    });
    fixture = TestBed.createComponent(PopupAssginDealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

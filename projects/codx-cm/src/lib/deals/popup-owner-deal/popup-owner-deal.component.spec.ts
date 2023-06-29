import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupOwnerDealComponent } from './popup-owner-deal.component';

describe('PopupOwnerDealComponent', () => {
  let component: PopupOwnerDealComponent;
  let fixture: ComponentFixture<PopupOwnerDealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupOwnerDealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupOwnerDealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

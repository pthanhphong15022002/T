import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddDealComponent } from './popup-add-deal.component';

describe('PopupAddDealComponent', () => {
  let component: PopupAddDealComponent;
  let fixture: ComponentFixture<PopupAddDealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddDealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddDealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

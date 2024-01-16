import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddPayTexceptComponent } from './popup-add-pay-texcept.component';

describe('PopupAddPayTexceptComponent', () => {
  let component: PopupAddPayTexceptComponent;
  let fixture: ComponentFixture<PopupAddPayTexceptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddPayTexceptComponent]
    });
    fixture = TestBed.createComponent(PopupAddPayTexceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupKowdMonthComponent } from './popup-kowd-month.component';

describe('PopupKowdMonthComponent', () => {
  let component: PopupKowdMonthComponent;
  let fixture: ComponentFixture<PopupKowdMonthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupKowdMonthComponent]
    });
    fixture = TestBed.createComponent(PopupKowdMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

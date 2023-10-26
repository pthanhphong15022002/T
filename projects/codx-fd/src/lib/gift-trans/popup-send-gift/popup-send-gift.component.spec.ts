import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSendGiftComponent } from './popup-send-gift.component';

describe('PopupSendGiftComponent', () => {
  let component: PopupSendGiftComponent;
  let fixture: ComponentFixture<PopupSendGiftComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupSendGiftComponent]
    });
    fixture = TestBed.createComponent(PopupSendGiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

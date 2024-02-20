import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRequestKowdComponent } from './popup-request-kowd.component';

describe('PopupRequestKowdComponent', () => {
  let component: PopupRequestKowdComponent;
  let fixture: ComponentFixture<PopupRequestKowdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupRequestKowdComponent]
    });
    fixture = TestBed.createComponent(PopupRequestKowdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

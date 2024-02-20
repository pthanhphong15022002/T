import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEkowdsComponent } from './popup-kowd-day.component';

describe('PopupEkowdsComponent', () => {
  let component: PopupEkowdsComponent;
  let fixture: ComponentFixture<PopupEkowdsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupEkowdsComponent]
    });
    fixture = TestBed.createComponent(PopupEkowdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

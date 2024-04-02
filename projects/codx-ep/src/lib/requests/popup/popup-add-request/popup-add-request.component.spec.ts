import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddRequestComponent } from './popup-add-request.component';

describe('PopupAddRequestComponent', () => {
  let component: PopupAddRequestComponent;
  let fixture: ComponentFixture<PopupAddRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddRequestComponent]
    });
    fixture = TestBed.createComponent(PopupAddRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

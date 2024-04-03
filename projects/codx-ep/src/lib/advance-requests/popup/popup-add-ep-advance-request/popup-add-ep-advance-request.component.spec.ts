import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddEpAdvanceRequestComponent } from './popup-add-ep-advance-request.component';

describe('PopupAddEpAdvanceRequestComponent', () => {
  let component: PopupAddEpAdvanceRequestComponent;
  let fixture: ComponentFixture<PopupAddEpAdvanceRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddEpAdvanceRequestComponent]
    });
    fixture = TestBed.createComponent(PopupAddEpAdvanceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

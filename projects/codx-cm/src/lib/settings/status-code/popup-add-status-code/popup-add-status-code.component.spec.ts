import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddStatusCodeComponent } from './popup-add-status-code.component';

describe('PopupAddStatusCodeComponent', () => {
  let component: PopupAddStatusCodeComponent;
  let fixture: ComponentFixture<PopupAddStatusCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddStatusCodeComponent]
    });
    fixture = TestBed.createComponent(PopupAddStatusCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

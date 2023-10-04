import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddAlertComponent } from './popup-add-alert.component';

describe('PopupAddAlertComponent', () => {
  let component: PopupAddAlertComponent;
  let fixture: ComponentFixture<PopupAddAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

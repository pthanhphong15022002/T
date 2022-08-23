import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddNotifyComponent } from './popup-add-notify.component';

describe('PopupAddNotifyComponent', () => {
  let component: PopupAddNotifyComponent;
  let fixture: ComponentFixture<PopupAddNotifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddNotifyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddNotifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

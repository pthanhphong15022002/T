import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUpdateStatusComponent } from './popup-update-status.component';

describe('PopupUpdateStatusComponent', () => {
  let component: PopupUpdateStatusComponent;
  let fixture: ComponentFixture<PopupUpdateStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupUpdateStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupUpdateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

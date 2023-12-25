import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupOverTimeComponent } from './popup-over-time.component';

describe('PopupOverTimeComponent', () => {
  let component: PopupOverTimeComponent;
  let fixture: ComponentFixture<PopupOverTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupOverTimeComponent]
    });
    fixture = TestBed.createComponent(PopupOverTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

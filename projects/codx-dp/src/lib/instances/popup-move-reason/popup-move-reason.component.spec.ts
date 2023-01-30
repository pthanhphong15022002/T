import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMoveReasonComponent } from './popup-move-reason.component';

describe('PopupMoveReasonComponent', () => {
  let component: PopupMoveReasonComponent;
  let fixture: ComponentFixture<PopupMoveReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupMoveReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupMoveReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

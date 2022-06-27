import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddAutoNumberComponent } from './popup-add-auto-number.component';

describe('PopupAddAutoNumberComponent', () => {
  let component: PopupAddAutoNumberComponent;
  let fixture: ComponentFixture<PopupAddAutoNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddAutoNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddAutoNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

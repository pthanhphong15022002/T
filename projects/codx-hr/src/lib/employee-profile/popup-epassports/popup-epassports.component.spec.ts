import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEPassportsComponent } from './popup-epassports.component';

describe('PopupEPassportsComponent', () => {
  let component: PopupEPassportsComponent;
  let fixture: ComponentFixture<PopupEPassportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEPassportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEPassportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

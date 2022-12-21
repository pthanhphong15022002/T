import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEappointionsComponent } from './popup-eappointions.component';

describe('PopupEappointionsComponent', () => {
  let component: PopupEappointionsComponent;
  let fixture: ComponentFixture<PopupEappointionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEappointionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEappointionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

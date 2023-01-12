import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEbenefitComponent } from './popup-ebenefit.component';

describe('PopupEbenefitComponent', () => {
  let component: PopupEbenefitComponent;
  let fixture: ComponentFixture<PopupEbenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEbenefitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEbenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

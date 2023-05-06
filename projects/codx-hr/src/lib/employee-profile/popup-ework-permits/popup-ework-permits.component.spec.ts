import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEWorkPermitsComponent } from './popup-ework-permits.component';

describe('PopupEWorkPermitsComponent', () => {
  let component: PopupEWorkPermitsComponent;
  let fixture: ComponentFixture<PopupEWorkPermitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEWorkPermitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEWorkPermitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

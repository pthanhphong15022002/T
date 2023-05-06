import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEAwardsComponent } from './popup-eawards.component';

describe('PopupEAwardsComponent', () => {
  let component: PopupEAwardsComponent;
  let fixture: ComponentFixture<PopupEAwardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEAwardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEAwardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

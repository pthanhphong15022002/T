import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpCashComponent } from './pop-up-cash.component';

describe('PopUpCashComponent', () => {
  let component: PopUpCashComponent;
  let fixture: ComponentFixture<PopUpCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpCashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

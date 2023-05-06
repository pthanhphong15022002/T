import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupECalculateSalaryComponent } from './popup-ecalculate-salary.component';

describe('PopupECalculateSalaryComponent', () => {
  let component: PopupECalculateSalaryComponent;
  let fixture: ComponentFixture<PopupECalculateSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupECalculateSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupECalculateSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

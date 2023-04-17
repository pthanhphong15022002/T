import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEmployeeBenefitComponent } from './popup-employee-benefit.component';

describe('PopupEmployeeBenefitComponent', () => {
  let component: PopupEmployeeBenefitComponent;
  let fixture: ComponentFixture<PopupEmployeeBenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEmployeeBenefitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEmployeeBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

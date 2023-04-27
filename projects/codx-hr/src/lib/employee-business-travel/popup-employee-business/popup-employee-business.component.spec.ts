import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEmployeeBusinessComponent } from './popup-employee-business.component';

describe('PopupEmployeeBusinessComponent', () => {
  let component: PopupEmployeeBusinessComponent;
  let fixture: ComponentFixture<PopupEmployeeBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEmployeeBusinessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEmployeeBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

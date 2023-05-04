import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInfoDetailComponent } from './employee-info-detail.component';

describe('EmployeeInfoDetailComponent', () => {
  let component: EmployeeInfoDetailComponent;
  let fixture: ComponentFixture<EmployeeInfoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeInfoDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

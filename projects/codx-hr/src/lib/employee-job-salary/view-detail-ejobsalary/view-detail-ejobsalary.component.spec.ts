import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailEjobsalaryComponent } from './view-detail-ejobsalary.component';

describe('ViewDetailEjobsalaryComponent', () => {
  let component: ViewDetailEjobsalaryComponent;
  let fixture: ComponentFixture<ViewDetailEjobsalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailEjobsalaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailEjobsalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

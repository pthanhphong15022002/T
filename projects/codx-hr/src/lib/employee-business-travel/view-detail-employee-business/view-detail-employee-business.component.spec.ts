import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailEmployeeBusinessComponent } from './view-detail-employee-business.component';

describe('ViewDetailEmployeeBusinessComponent', () => {
  let component: ViewDetailEmployeeBusinessComponent;
  let fixture: ComponentFixture<ViewDetailEmployeeBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailEmployeeBusinessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailEmployeeBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

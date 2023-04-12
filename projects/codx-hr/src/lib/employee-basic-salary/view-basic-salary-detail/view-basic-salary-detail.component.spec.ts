import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBasicSalaryDetailComponent } from './view-basic-salary-detail.component';

describe('ViewBasicSalaryDetailComponent', () => {
  let component: ViewBasicSalaryDetailComponent;
  let fixture: ComponentFixture<ViewBasicSalaryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBasicSalaryDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBasicSalaryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

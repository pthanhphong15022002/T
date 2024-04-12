import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrTableNewemployeeComponent } from './hr-table-newemployee.component';

describe('HrTableNewemployeeComponent', () => {
  let component: HrTableNewemployeeComponent;
  let fixture: ComponentFixture<HrTableNewemployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrTableNewemployeeComponent]
    });
    fixture = TestBed.createComponent(HrTableNewemployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

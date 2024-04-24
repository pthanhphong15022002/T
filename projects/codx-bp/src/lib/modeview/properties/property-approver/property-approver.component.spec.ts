import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyApproverComponent } from './property-approver.component';

describe('PropertyApproverComponent', () => {
  let component: PropertyApproverComponent;
  let fixture: ComponentFixture<PropertyApproverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyApproverComponent]
    });
    fixture = TestBed.createComponent(PropertyApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

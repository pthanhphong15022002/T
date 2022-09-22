import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDedicationComponent } from './policy-dedication.component';

describe('PolicyDedicationComponent', () => {
  let component: PolicyDedicationComponent;
  let fixture: ComponentFixture<PolicyDedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyDedicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

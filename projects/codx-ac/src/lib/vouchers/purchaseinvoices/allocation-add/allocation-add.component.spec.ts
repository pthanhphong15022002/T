import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationAddComponent } from './allocation-add.component';

describe('AllocationAddComponent', () => {
  let component: AllocationAddComponent;
  let fixture: ComponentFixture<AllocationAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllocationAddComponent]
    });
    fixture = TestBed.createComponent(AllocationAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

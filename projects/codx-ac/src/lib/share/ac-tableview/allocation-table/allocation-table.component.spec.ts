import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationTableComponent } from './allocation-table.component';

describe('AllocationTableComponent', () => {
  let component: AllocationTableComponent;
  let fixture: ComponentFixture<AllocationTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllocationTableComponent]
    });
    fixture = TestBed.createComponent(AllocationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

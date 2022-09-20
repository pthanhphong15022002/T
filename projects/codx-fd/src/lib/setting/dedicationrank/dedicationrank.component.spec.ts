import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicationrankComponent } from './dedicationrank.component';

describe('DedicationrankComponent', () => {
  let component: DedicationrankComponent;
  let fixture: ComponentFixture<DedicationrankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DedicationrankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DedicationrankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

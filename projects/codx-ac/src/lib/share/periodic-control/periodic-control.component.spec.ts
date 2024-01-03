import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicControlComponent } from './periodic-control.component';

describe('PeriodicControlComponent', () => {
  let component: PeriodicControlComponent;
  let fixture: ComponentFixture<PeriodicControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeriodicControlComponent]
    });
    fixture = TestBed.createComponent(PeriodicControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

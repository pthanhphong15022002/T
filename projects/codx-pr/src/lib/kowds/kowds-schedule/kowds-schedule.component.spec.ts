import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KowdsScheduleComponent } from './kowds-schedule.component';

describe('KowdsScheduleComponent', () => {
  let component: KowdsScheduleComponent;
  let fixture: ComponentFixture<KowdsScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KowdsScheduleComponent]
    });
    fixture = TestBed.createComponent(KowdsScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

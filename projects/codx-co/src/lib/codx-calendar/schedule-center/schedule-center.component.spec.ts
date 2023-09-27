import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCenterComponent } from './schedule-center.component';

describe('ScheduleCenterComponent', () => {
  let component: ScheduleCenterComponent;
  let fixture: ComponentFixture<ScheduleCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleCenterComponent]
    });
    fixture = TestBed.createComponent(ScheduleCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

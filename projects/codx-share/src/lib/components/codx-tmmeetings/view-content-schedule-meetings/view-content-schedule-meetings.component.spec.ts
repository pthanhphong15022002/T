import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewContentScheduleMeetingsComponent } from './view-content-schedule-meetings.component';

describe('ViewContentScheduleMeetingsComponent', () => {
  let component: ViewContentScheduleMeetingsComponent;
  let fixture: ComponentFixture<ViewContentScheduleMeetingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewContentScheduleMeetingsComponent]
    });
    fixture = TestBed.createComponent(ViewContentScheduleMeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

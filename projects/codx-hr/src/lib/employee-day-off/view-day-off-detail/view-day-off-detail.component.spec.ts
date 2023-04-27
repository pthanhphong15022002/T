import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDayOffDetailComponent } from './view-day-off-detail.component';

describe('ViewDayOffDetailComponent', () => {
  let component: ViewDayOffDetailComponent;
  let fixture: ComponentFixture<ViewDayOffDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDayOffDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDayOffDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailsSprintsComponent } from './view-details-sprints.component';

describe('ViewDetailsSprintsComponent', () => {
  let component: ViewDetailsSprintsComponent;
  let fixture: ComponentFixture<ViewDetailsSprintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailsSprintsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDetailsSprintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListBpTasksComponent } from './view-list-bp-tasks.component';

describe('ViewListBpTasksComponent', () => {
  let component: ViewListBpTasksComponent;
  let fixture: ComponentFixture<ViewListBpTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewListBpTasksComponent]
    });
    fixture = TestBed.createComponent(ViewListBpTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

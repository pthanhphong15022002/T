import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupBpTasksComponent } from './popup-bp-tasks.component';

describe('PopupBpTasksComponent', () => {
  let component: PopupBpTasksComponent;
  let fixture: ComponentFixture<PopupBpTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupBpTasksComponent]
    });
    fixture = TestBed.createComponent(PopupBpTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

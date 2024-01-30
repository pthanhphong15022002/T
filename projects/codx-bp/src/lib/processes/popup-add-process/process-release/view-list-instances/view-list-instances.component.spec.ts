import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListInstancesComponent } from './view-list-instances.component';

describe('ViewListInstancesComponent', () => {
  let component: ViewListInstancesComponent;
  let fixture: ComponentFixture<ViewListInstancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewListInstancesComponent]
    });
    fixture = TestBed.createComponent(ViewListInstancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

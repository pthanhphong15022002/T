import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceRequestsComponent } from './advance-requests.component';

describe('AdvanceRequestsComponent', () => {
  let component: AdvanceRequestsComponent;
  let fixture: ComponentFixture<AdvanceRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceRequestsComponent]
    });
    fixture = TestBed.createComponent(AdvanceRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

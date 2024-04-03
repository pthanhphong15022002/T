import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceRequestsViewDetaiComponent } from './advance-requests-view-detai.component';

describe('AdvanceRequestsViewDetaiComponent', () => {
  let component: AdvanceRequestsViewDetaiComponent;
  let fixture: ComponentFixture<AdvanceRequestsViewDetaiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceRequestsViewDetaiComponent]
    });
    fixture = TestBed.createComponent(AdvanceRequestsViewDetaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

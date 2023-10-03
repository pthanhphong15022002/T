import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailOtComponent } from './view-detail-ot.component';

describe('ViewDetailOtComponent', () => {
  let component: ViewDetailOtComponent;
  let fixture: ComponentFixture<ViewDetailOtComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDetailOtComponent]
    });
    fixture = TestBed.createComponent(ViewDetailOtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailPopupComponent } from './view-detail-popup.component';

describe('ViewDetailPopupComponent', () => {
  let component: ViewDetailPopupComponent;
  let fixture: ComponentFixture<ViewDetailPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDetailPopupComponent]
    });
    fixture = TestBed.createComponent(ViewDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

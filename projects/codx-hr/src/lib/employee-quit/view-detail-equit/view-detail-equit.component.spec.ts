import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailEquitComponent } from './view-detail-equit.component';

describe('ViewDetailEquitComponent', () => {
  let component: ViewDetailEquitComponent;
  let fixture: ComponentFixture<ViewDetailEquitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDetailEquitComponent]
    });
    fixture = TestBed.createComponent(ViewDetailEquitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

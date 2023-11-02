import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvoucherStatisticalComponent } from './evoucher-statistical.component';

describe('EvoucherStatisticalComponent', () => {
  let component: EvoucherStatisticalComponent;
  let fixture: ComponentFixture<EvoucherStatisticalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvoucherStatisticalComponent]
    });
    fixture = TestBed.createComponent(EvoucherStatisticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

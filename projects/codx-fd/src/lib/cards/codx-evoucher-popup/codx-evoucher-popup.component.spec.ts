import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxEvoucherPopupComponent } from './codx-evoucher-popup.component';

describe('CodxEvoucherPopupComponent', () => {
  let component: CodxEvoucherPopupComponent;
  let fixture: ComponentFixture<CodxEvoucherPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxEvoucherPopupComponent]
    });
    fixture = TestBed.createComponent(CodxEvoucherPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

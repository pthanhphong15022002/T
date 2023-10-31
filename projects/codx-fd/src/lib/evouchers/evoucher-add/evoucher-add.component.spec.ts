import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvoucherAddComponent } from './evoucher-add.component';

describe('EvoucherAddComponent', () => {
  let component: EvoucherAddComponent;
  let fixture: ComponentFixture<EvoucherAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvoucherAddComponent]
    });
    fixture = TestBed.createComponent(EvoucherAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

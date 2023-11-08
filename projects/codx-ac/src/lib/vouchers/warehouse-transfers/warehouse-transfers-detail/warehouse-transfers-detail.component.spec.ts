import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseTransfersDetailComponent } from './warehouse-transfers-detail.component';

describe('WarehouseTransfersDetailComponent', () => {
  let component: WarehouseTransfersDetailComponent;
  let fixture: ComponentFixture<WarehouseTransfersDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WarehouseTransfersDetailComponent]
    });
    fixture = TestBed.createComponent(WarehouseTransfersDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

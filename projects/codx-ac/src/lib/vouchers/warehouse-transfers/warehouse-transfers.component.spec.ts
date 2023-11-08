import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseTransfersComponent } from './warehouse-transfers.component';

describe('WarehouseTransfersComponent', () => {
  let component: WarehouseTransfersComponent;
  let fixture: ComponentFixture<WarehouseTransfersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WarehouseTransfersComponent]
    });
    fixture = TestBed.createComponent(WarehouseTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

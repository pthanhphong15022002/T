import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseTransfersAddComponent } from './warehouse-transfers-add.component';

describe('WarehouseTransfersAddComponent', () => {
  let component: WarehouseTransfersAddComponent;
  let fixture: ComponentFixture<WarehouseTransfersAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WarehouseTransfersAddComponent]
    });
    fixture = TestBed.createComponent(WarehouseTransfersAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

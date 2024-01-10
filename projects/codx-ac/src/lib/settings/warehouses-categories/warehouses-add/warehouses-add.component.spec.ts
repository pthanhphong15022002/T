import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehousesAddComponent } from './warehouses-add.component';

describe('PopAddWarehousesComponent', () => {
  let component: WarehousesAddComponent;
  let fixture: ComponentFixture<WarehousesAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehousesAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehousesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

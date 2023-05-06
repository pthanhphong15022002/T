import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddWarehousesComponent } from './pop-add-warehouses.component';

describe('PopAddWarehousesComponent', () => {
  let component: PopAddWarehousesComponent;
  let fixture: ComponentFixture<PopAddWarehousesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddWarehousesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddWarehousesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersAddComponent } from './customers-add.component';

describe('PopAddCustomersComponent', () => {
  let component: CustomersAddComponent;
  let fixture: ComponentFixture<CustomersAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomersAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

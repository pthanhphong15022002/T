import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsAddComponent } from './vendors-add.component';

describe('PopAddVendorsComponent', () => {
  let component: VendorsAddComponent;
  let fixture: ComponentFixture<VendorsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddVendorsComponent } from './pop-add-vendors.component';

describe('PopAddVendorsComponent', () => {
  let component: PopAddVendorsComponent;
  let fixture: ComponentFixture<PopAddVendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddVendorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddVendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddAddressComponent } from './pop-add-address.component';

describe('PopAddAddressComponent', () => {
  let component: PopAddAddressComponent;
  let fixture: ComponentFixture<PopAddAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

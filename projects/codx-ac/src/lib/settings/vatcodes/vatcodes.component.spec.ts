import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VATCodesComponent } from './vatcodes.component';

describe('VATCodesComponent', () => {
  let component: VATCodesComponent;
  let fixture: ComponentFixture<VATCodesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VATCodesComponent]
    });
    fixture = TestBed.createComponent(VATCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

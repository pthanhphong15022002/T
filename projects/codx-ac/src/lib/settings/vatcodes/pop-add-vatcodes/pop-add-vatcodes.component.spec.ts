import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddVatcodesComponent } from './pop-add-vatcodes.component';

describe('PopAddVatcodesComponent', () => {
  let component: PopAddVatcodesComponent;
  let fixture: ComponentFixture<PopAddVatcodesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopAddVatcodesComponent]
    });
    fixture = TestBed.createComponent(PopAddVatcodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

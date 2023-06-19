import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpVatComponent } from './pop-up-vat.component';

describe('PopUpVatComponent', () => {
  let component: PopUpVatComponent;
  let fixture: ComponentFixture<PopUpVatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpVatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpVatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

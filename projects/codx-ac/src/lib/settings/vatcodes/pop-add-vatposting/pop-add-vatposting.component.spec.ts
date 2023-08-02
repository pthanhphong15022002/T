import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddVatpostingComponent } from './pop-add-vatposting.component';

describe('PopAddVatpostingComponent', () => {
  let component: PopAddVatpostingComponent;
  let fixture: ComponentFixture<PopAddVatpostingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopAddVatpostingComponent]
    });
    fixture = TestBed.createComponent(PopAddVatpostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

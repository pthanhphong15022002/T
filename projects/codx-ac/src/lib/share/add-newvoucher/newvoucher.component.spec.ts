import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewvoucherComponent } from './newvoucher.component';

describe('NewvoucherComponent', () => {
  let component: NewvoucherComponent;
  let fixture: ComponentFixture<NewvoucherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewvoucherComponent]
    });
    fixture = TestBed.createComponent(NewvoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

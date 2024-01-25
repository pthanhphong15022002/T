import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProcessDefaultComponent } from './add-process-default.component';

describe('AddProcessDefaultComponent', () => {
  let component: AddProcessDefaultComponent;
  let fixture: ComponentFixture<AddProcessDefaultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddProcessDefaultComponent]
    });
    fixture = TestBed.createComponent(AddProcessDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

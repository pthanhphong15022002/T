import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDefaultComponent } from './add-default.component';

describe('AddDefaultComponent', () => {
  let component: AddDefaultComponent;
  let fixture: ComponentFixture<AddDefaultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddDefaultComponent]
    });
    fixture = TestBed.createComponent(AddDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

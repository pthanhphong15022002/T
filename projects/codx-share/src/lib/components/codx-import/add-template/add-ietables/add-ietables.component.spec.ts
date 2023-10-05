import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIetablesComponent } from './add-ietables.component';

describe('AddIetablesComponent', () => {
  let component: AddIetablesComponent;
  let fixture: ComponentFixture<AddIetablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddIetablesComponent]
    });
    fixture = TestBed.createComponent(AddIetablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

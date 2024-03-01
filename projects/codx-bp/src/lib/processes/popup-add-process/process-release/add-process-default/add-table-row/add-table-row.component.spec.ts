import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTableRowComponent } from './add-table-row.component';

describe('AddTableRowComponent', () => {
  let component: AddTableRowComponent;
  let fixture: ComponentFixture<AddTableRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTableRowComponent]
    });
    fixture = TestBed.createComponent(AddTableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableGripComponent } from './table-grip.component';

describe('TableGripComponent', () => {
  let component: TableGripComponent;
  let fixture: ComponentFixture<TableGripComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableGripComponent]
    });
    fixture = TestBed.createComponent(TableGripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

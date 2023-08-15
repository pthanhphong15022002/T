import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAccountingComponent } from './table-accounting.component';

describe('TableAccountingComponent', () => {
  let component: TableAccountingComponent;
  let fixture: ComponentFixture<TableAccountingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableAccountingComponent]
    });
    fixture = TestBed.createComponent(TableAccountingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

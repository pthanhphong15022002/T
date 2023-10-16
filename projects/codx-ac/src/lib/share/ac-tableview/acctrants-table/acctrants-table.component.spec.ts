import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcctrantsTableComponent } from './acctrants-table.component';

describe('AcctrantsTableComponent', () => {
  let component: AcctrantsTableComponent;
  let fixture: ComponentFixture<AcctrantsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcctrantsTableComponent]
    });
    fixture = TestBed.createComponent(AcctrantsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

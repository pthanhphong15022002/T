import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxListReportsComponent } from './codx-list-reports.component';

describe('CodxListReportsComponent', () => {
  let component: CodxListReportsComponent;
  let fixture: ComponentFixture<CodxListReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxListReportsComponent]
    });
    fixture = TestBed.createComponent(CodxListReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
